import { prisma } from './db';
import { ParsedTransaction } from './emailParser';
import { ExpenseCategory } from '@prisma/client';

export interface IngestResult {
  success: boolean;
  message: string;
  expenseId?: string;
  profileId: string;
  truckRegistration?: string;
  taggedTripId?: string;
  amount: number;
}

/**
 * Resolves a Profile from inbound email metadata:
 * - Checks recipient address prefix (e.g. apex-fleet@domain.com)
 * - Checks linked email or fallback to default profile
 */
export async function resolveProfileForInboundEmail(
  toAddress: string,
  fromAddress: string
): Promise<string> {
  // 1. Try finding a company matching domain or exact email
  const company = await prisma.company.findFirst({
    where: {
      email: {
        contains: fromAddress,
      },
    },
    select: { profileId: true },
  });

  if (company) return company.profileId;

  // 2. Check if the 'To' address has a dedicated tenant slug (e.g. `expenses-apex@inbound.fleettrack.app`)
  const slugMatch = toAddress.match(/([a-zA-Z0-9_\-]+)@/);
  if (slugMatch) {
    const rawSlug = slugMatch[1].toLowerCase();
    // Strip common prefixes: expenses-, sync-, fleet-
    const cleanSlug = rawSlug.replace(/^(expenses|sync|fleet)[_-]/, '');

    // Search profile by clean slug, raw slug, or exact id
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: rawSlug },
          { id: cleanSlug },
          { name: { contains: cleanSlug, mode: 'insensitive' } },
          { name: { contains: rawSlug, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });
    if (profile) return profile.id;
  }

  // 3. Fallback: Return default profile
  const defaultProfile = await prisma.profile.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });

  if (defaultProfile) return defaultProfile.id;

  // 4. Return any first profile
  const anyProfile = await prisma.profile.findFirst({
    select: { id: true },
  });

  if (!anyProfile) {
    // If no profile exists yet, create one
    const created = await prisma.profile.create({
      data: {
        name: 'Primary Fleet Entity',
        isDefault: true,
      },
    });
    return created.id;
  }

  return anyProfile.id;
}

/**
 * Ingests a parsed email transaction into the database:
 * - Links to the correct Profile
 * - Resolves or registers Truck
 * - Tags active ongoing Trip
 * - Persists TruckExpense
 */
export async function recordParsedExpense(
  parsed: ParsedTransaction,
  profileId: string
): Promise<IngestResult> {
  if (parsed.amount <= 0) {
    return {
      success: false,
      message: 'Transaction amount is 0 or unparseable. Skipping record creation.',
      profileId,
      amount: parsed.amount,
    };
  }

  // 1. Match or find Truck in the profile
  let truck = null;
  if (parsed.vehicleNumber) {
    const cleanPlate = parsed.vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Query trucks in this profile
    const allTrucks = await prisma.truck.findMany({
      where: { profileId },
    });

    truck = allTrucks.find((t) => {
      const regClean = t.registrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return regClean.includes(cleanPlate) || cleanPlate.includes(regClean);
    });

    // If truck not found in master, auto-register as ACTIVE vehicle
    if (!truck) {
      truck = await prisma.truck.create({
        data: {
          profileId,
          registrationNumber: parsed.vehicleNumber,
          model: 'Commercial Vehicle (Auto-Discovered)',
          capacity: 'Standard',
          status: 'ACTIVE',
        },
      });
    }
  } else {
    // Fallback: pick the first available truck in the profile
    truck = await prisma.truck.findFirst({
      where: { profileId },
    });
  }

  if (!truck) {
    // Create placeholder truck if database was completely empty
    truck = await prisma.truck.create({
      data: {
        profileId,
        registrationNumber: parsed.vehicleNumber || 'MH-12-AUTO-0001',
        model: 'Fleet Vehicle (Auto-Created)',
        capacity: 'Standard',
        status: 'ACTIVE',
      },
    });
  }

  // 2. Locate active ongoing trip for this truck on or before transaction date
  const ongoingTrip = await prisma.trip.findFirst({
    where: {
      profileId,
      truckId: truck.id,
      date: {
        lte: parsed.transactionDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Map Category
  let category: ExpenseCategory = ExpenseCategory.OTHER;
  if (parsed.category === 'TOLL') category = ExpenseCategory.TOLL;
  else if (parsed.category === 'DIESEL') category = ExpenseCategory.DIESEL;
  else if (parsed.category === 'MAINTENANCE') category = ExpenseCategory.MAINTENANCE;

  // Determine Payment Method
  const paymentMethod =
    parsed.category === 'TOLL'
      ? 'FASTag (Webhook Auto)'
      : parsed.category === 'DIESEL'
      ? 'Fleet Card (Webhook Auto)'
      : 'Bank Debit (Webhook Auto)';

  const notes = `${parsed.notes}${
    ongoingTrip
      ? ` | Tagged to Trip: ${ongoingTrip.fromLocation} -> ${ongoingTrip.toLocation}`
      : ' | No active voyage on date'
  }`;

  // 3. Insert into truck_expenses table
  const createdExpense = await prisma.truckExpense.create({
    data: {
      profileId,
      truckId: truck.id,
      date: parsed.transactionDate,
      category,
      amount: parsed.amount,
      paymentMethod,
      notes,
    },
  });

  return {
    success: true,
    message: `Successfully recorded ${category} expense of ₹${parsed.amount.toLocaleString('en-IN')}`,
    expenseId: createdExpense.id,
    profileId,
    truckRegistration: truck.registrationNumber,
    taggedTripId: ongoingTrip ? ongoingTrip.id : undefined,
    amount: parsed.amount,
  };
}
