import type { IncomingMessage, ServerResponse } from 'http';
import { parseInboundEmail } from '../lib/emailParser';
import { recordParsedExpense, resolveProfileForInboundEmail } from '../lib/fleetExpenseService';

// Vercel Serverless Function Request & Response Interfaces
interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
  body: any;
}

interface VercelResponse extends ServerResponse {
  send: (body: any) => VercelResponse;
  json: (jsonBody: any) => VercelResponse;
  status: (statusCode: number) => VercelResponse;
}

/**
 * Validates webhook security via Bearer Token, Header, or Query Parameter
 */
function isAuthorized(req: VercelRequest): boolean {
  const expectedSecret = process.env.EMAIL_WEBHOOK_SECRET;

  // If no secret is configured in environment variables, warn and allow in dev
  if (!expectedSecret) {
    console.warn('[Webhook Security] EMAIL_WEBHOOK_SECRET not configured. Allowing request.');
    return true;
  }

  // Check query parameter: ?token=XYZ or ?key=XYZ
  const queryToken = req.query?.token || req.query?.key;
  if (queryToken === expectedSecret) return true;

  // Check header: x-webhook-secret or x-postmark-secret
  const headerSecret = req.headers['x-webhook-secret'] || req.headers['x-postmark-secret'];
  if (headerSecret === expectedSecret) return true;

  // Check Authorization: Bearer XYZ
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken === expectedSecret) return true;
  }

  return false;
}

/**
 * Normalizes payload fields across Postmark, SendGrid, and custom JSON payloads
 */
function extractEmailFields(body: any): {
  subject: string;
  text?: string;
  html?: string;
  from: string;
  to: string;
  date?: string;
} {
  if (!body || typeof body !== 'object') {
    return { subject: '', from: '', to: '' };
  }

  // 1. Postmark Format (PascalCase)
  if ('Subject' in body || 'TextBody' in body || 'From' in body) {
    return {
      subject: String(body.Subject || ''),
      text: body.TextBody ? String(body.TextBody) : undefined,
      html: body.HtmlBody ? String(body.HtmlBody) : undefined,
      from: String(body.From || ''),
      to: String(body.To || ''),
      date: body.Date ? String(body.Date) : undefined,
    };
  }

  // 2. SendGrid Inbound Parse Format (lowercase)
  return {
    subject: String(body.subject || body.Subject || ''),
    text: body.text ? String(body.text) : undefined,
    html: body.html ? String(body.html) : undefined,
    from: String(body.from || body.From || ''),
    to: String(body.to || body.To || ''),
    date: body.date ? String(body.date) : undefined,
  };
}

/**
 * Main Webhook Handler
 * Route: POST /api/webhooks/email
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Email webhook endpoint only accepts POST requests.',
    });
  }

  // 1. Webhook Signature & Secret Verification
  if (!isAuthorized(req)) {
    console.error('[Webhook Unauthorized] Invalid or missing security token.');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid webhook authentication secret or token.',
    });
  }

  try {
    const payload = req.body;
    const { subject, text, html, from, to, date } = extractEmailFields(payload);

    console.log(`[Webhook Inbound] Received email from: "${from}" | To: "${to}" | Subject: "${subject}"`);

    // Handle Gmail Forwarding Confirmation Email
    const fullBody = `${text || ''} ${html || ''}`;
    if (
      from.includes('google.com') ||
      subject.toLowerCase().includes('gmail forwarding confirmation') ||
      fullBody.includes('requested to automatically forward mail')
    ) {
      console.log('[Gmail Forwarding] Received Google forwarding confirmation email!');
      const linkMatch = fullBody.match(/https:\/\/mail\.google\.com\/mail\/vf-[a-zA-Z0-9_\-]+/i);
      const codeMatch = fullBody.match(/Confirmation code:\s*([0-9]{7,12})/i);
      const code = codeMatch ? codeMatch[1] : null;

      let autoConfirmed = false;
      if (linkMatch && linkMatch[0]) {
        try {
          await fetch(linkMatch[0]);
          autoConfirmed = true;
          console.log('[Gmail Forwarding] Auto-confirmed forwarding link successfully with Google!');
        } catch (fetchErr) {
          console.warn('[Gmail Forwarding] Auto-confirmation fetch error:', fetchErr);
        }
      }

      return res.status(200).json({
        success: true,
        type: 'GMAIL_FORWARDING_CONFIRMATION',
        message: autoConfirmed
          ? 'Gmail forwarding address was automatically confirmed with Google!'
          : `Gmail confirmation code extracted: ${code}`,
        confirmationCode: code,
        confirmationUrl: linkMatch ? linkMatch[0] : null,
      });
    }

    // 2. Parse Email Content using Regex and Pattern Extractor
    const parsed = parseInboundEmail(subject, text, html, date);

    if (!parsed) {
      // Return 200 to acknowledge webhook so provider doesn't re-attempt delivery
      return res.status(200).json({
        success: false,
        message: 'Email body or subject was empty. No expense extracted.',
      });
    }

    // Ignore credit / refund alerts (unless user wants them recorded as offsets)
    if (parsed.type === 'CREDIT') {
      console.log(`[Webhook Skipped] Credit / top-up alert ignored: "${subject}"`);
      return res.status(200).json({
        success: true,
        message: 'Credit or wallet recharge alert detected. Skipped expense logging.',
        type: 'CREDIT',
        amount: parsed.amount,
      });
    }

    if (parsed.amount <= 0) {
      return res.status(200).json({
        success: false,
        message: 'Could not detect a valid debit amount in email payload.',
        parsedCandidate: parsed,
      });
    }

    // 3. Resolve Tenant Profile
    const profileId = await resolveProfileForInboundEmail(to, from);

    // 4. Record to Database (link truck and active voyage)
    const ingestResult = await recordParsedExpense(parsed, profileId);

    console.log(
      `[Webhook Ingested] Recorded ₹${ingestResult.amount} (${parsed.category}) for Truck ${ingestResult.truckRegistration} (Profile: ${profileId})`
    );

    // 5. Success Response
    return res.status(200).json({
      success: true,
      message: ingestResult.message,
      data: {
        expenseId: ingestResult.expenseId,
        profileId: ingestResult.profileId,
        truckRegistration: ingestResult.truckRegistration,
        taggedTripId: ingestResult.taggedTripId,
        category: parsed.category,
        amount: ingestResult.amount,
        merchant: parsed.merchant,
        transactionDate: parsed.transactionDate,
      },
    });
  } catch (error: any) {
    console.error('[Webhook Error] Failed to process inbound email:', error);

    // Return 500 so webhook provider can retry if database connection briefly fails
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || 'Failed to process email webhook.',
    });
  }
}
