export interface ParsedTransaction {
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  merchant: string;
  transactionDate: Date;
  vehicleNumber: string | null;
  category: 'TOLL' | 'DIESEL' | 'MAINTENANCE' | 'OTHER';
  confidence: number; // 0 to 1 score
  rawSubject: string;
  notes: string;
}

/**
 * Strips HTML tags, decodes common entities, and normalizes whitespaces
 */
export function cleanEmailBody(bodyText?: string, bodyHtml?: string): string {
  if (bodyText && bodyText.trim().length > 0) {
    return bodyText.trim();
  }

  if (!bodyHtml) return '';

  return bodyHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses inbound bank or fleet alert email body and metadata into structured transaction data
 */
export function parseInboundEmail(
  subject: string,
  bodyText?: string,
  bodyHtml?: string,
  fallbackDate?: string | Date
): ParsedTransaction | null {
  const content = cleanEmailBody(bodyText, bodyHtml);
  if (!content && !subject) return null;

  const combinedText = `${subject} \n ${content}`;

  // 1. Determine Debit vs Credit
  const isCredit = /\b(credited|credit of|received|refund|cashback|top-up successful|recharge successful)\b/i.test(combinedText);
  const isDebit = /\b(debited|debit of|spent|paid|purchase of|deducted|transaction alert|toll charged)\b/i.test(combinedText) || !isCredit;
  const type: 'DEBIT' | 'CREDIT' = isCredit && !isDebit ? 'CREDIT' : 'DEBIT';

  // 2. Extract Transaction Amount (supports INR, Rs, ₹ with comma separators)
  let amount = 0;
  const amountRegexes = [
    /(?:INR|Rs\.?|₹)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i,
    /(?:amount of|for sum of|debited by)\s*(?:INR|Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/i,
    /([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)\s*(?:INR|Rs\.?|₹|debited|spent)/i,
  ];

  for (const regex of amountRegexes) {
    const match = combinedText.match(regex);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 3. Extract Vehicle Registration Number Plate (Indian Standard: e.g. MH-12-RN-4825 or MH12RN4825)
  let vehicleNumber: string | null = null;
  const vehicleRegexes = [
    // Labeled plates (e.g. "Vehicle MH-12-RN-4825" or "VRN: MH12AB1234")
    /(?:vehicle|veh\s*no|vrn|tag\s*id|registration|truck)\s*(?:no\.?|id|:|-)?\s*([A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4})/i,
    // Direct plate pattern
    /\b([A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4})\b/i,
  ];

  for (const regex of vehicleRegexes) {
    const match = combinedText.match(regex);
    if (match && match[1]) {
      // Standardize plate format to XX-00-XX-0000
      const rawPlate = match[1].toUpperCase().replace(/\s+/g, '-');
      vehicleNumber = rawPlate;
      break;
    }
  }

  // 4. Identify Merchant / Toll Plaza / Station
  let merchant = 'Unknown Merchant';
  const plazaMatch = combinedText.match(/(?:at|plaza:?)\s*([A-Za-z0-9\s\-]+?)\s*(?:toll plaza|plaza|toll fee|on\s*\d{2})/i);
  const fuelMatch = combinedText.match(/(?:at|pump:?)\s*([A-Za-z0-9\s\-]+?)\s*(?:retail outlet|petrol pump|fuel station|highway pump|ro\b)/i);
  const vendorMatch = combinedText.match(/(?:to|merchant:?|vpa:?)\s*([A-Za-z0-9\s\-]+?)\s*(?:on\s*\d{2}|via|ref)/i);

  if (plazaMatch && plazaMatch[1]) {
    merchant = `${plazaMatch[1].trim()} Toll Plaza`;
  } else if (fuelMatch && fuelMatch[1]) {
    merchant = fuelMatch[1].trim();
  } else if (vendorMatch && vendorMatch[1]) {
    merchant = vendorMatch[1].trim();
  } else if (/(FASTag|NETC)/i.test(combinedText)) {
    merchant = 'Highway Toll Authority';
  } else if (/(IOCL|Indian Oil)/i.test(combinedText)) {
    merchant = 'Indian Oil Corporation Ltd (IOCL)';
  } else if (/(BPCL|Bharat Petroleum)/i.test(combinedText)) {
    merchant = 'Bharat Petroleum Corp (BPCL)';
  } else if (/(HPCL|Hindustan Petroleum)/i.test(combinedText)) {
    merchant = 'Hindustan Petroleum Corp (HPCL)';
  }

  // 5. Categorize Expense
  let category: 'TOLL' | 'DIESEL' | 'MAINTENANCE' | 'OTHER' = 'OTHER';
  if (/toll|fastag|netc|plaza|expressway/i.test(combinedText)) {
    category = 'TOLL';
  } else if (/fuel|diesel|petrol|iocl|bpcl|hpcl|pump|xtrapower|smartfleet/i.test(combinedText)) {
    category = 'DIESEL';
  } else if (/repair|service|liner|tyre|puncture|maintenance|spare/i.test(combinedText)) {
    category = 'MAINTENANCE';
  }

  // 6. Extract Transaction Date
  let transactionDate: Date = fallbackDate ? new Date(fallbackDate) : new Date();
  const dateMatch = combinedText.match(/(?:on|dated?)\s*(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/i);
  if (dateMatch && dateMatch[1]) {
    const rawDateStr = dateMatch[1].replace(/\./g, '-').replace(/\//g, '-');
    const parts = rawDateStr.split('-');
    if (parts.length === 3) {
      // Assuming DD-MM-YYYY or YYYY-MM-DD
      if (parts[0].length === 4) {
        transactionDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        transactionDate = new Date(`${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
      }
    }
  }

  if (isNaN(transactionDate.getTime())) {
    transactionDate = new Date();
  }

  // Confidence estimation
  let confidence = 0.4;
  if (amount > 0) confidence += 0.3;
  if (vehicleNumber) confidence += 0.2;
  if (category !== 'OTHER') confidence += 0.1;

  const notes = `Auto-parsed via webhook | Merchant: ${merchant} | Category: ${category} | Ref Plate: ${vehicleNumber || 'Unspecified'} | Raw Subject: "${subject}"`;

  return {
    amount,
    type,
    merchant,
    transactionDate,
    vehicleNumber,
    category,
    confidence,
    rawSubject: subject,
    notes,
  };
}
