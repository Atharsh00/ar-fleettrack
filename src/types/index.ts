export type TruckStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'INACTIVE';
export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
export type TripStatus = 'COMPLETED' | 'IN_TRANSIT' | 'CANCELLED';

export type ExpenseCategory =
  | 'DIESEL'
  | 'MAINTENANCE'
  | 'TOLL'
  | 'INSURANCE'
  | 'PERMITS'
  | 'SPARE_PARTS'
  | 'OTHER';

export type DriverPaymentType = 'SALARY_PAYOUT' | 'DRIVER_EXPENSE';

export interface Profile {
  id: string;
  name: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface SystemRules {
  defaultDriverSalaryPercent: number; // e.g. 15%
  defaultTdsPercent: number; // e.g. 1%
}

export interface Truck {
  id: string;
  profileId: string;
  registrationNumber: string;
  model: string;
  capacity: string;
  registrationDate?: string;
  notes?: string;
  status?: TruckStatus;
}

export interface Company {
  id: string;
  profileId: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
}

export interface Driver {
  id: string;
  profileId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  joiningDate?: string;
  status: DriverStatus;
}

export interface Trip {
  id: string;
  profileId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  truckId: string;
  companyId: string;
  driverId: string;
  fromLocation: string; // Origin
  toLocation: string; // Primary destination
  additionalDrops: string[]; // Dynamic intermediate/additional drop points
  route?: string; // Formatted route summary
  
  // Revised Financials:
  totalRent: number; // Agreed Gross Rent
  commissionAmount: number; // Broker / Agent commission
  isTdsDeducted: boolean; // Boolean flag
  tdsPercent: number; // e.g., 1%
  tdsAmount: number; // 1% of totalRent if isTdsDeducted else 0
  netRent: number; // totalRent - tdsAmount - commissionAmount
  driverCommissionPercent: number; // e.g., 15%
  driverCommission: number; // 15% of Net Rent
  advanceReceived: number;
  balancePending: number; // totalRent - advanceReceived - commissionAmount - tdsAmount
  status: TripStatus;
  notes?: string;
}

export interface TruckExpense {
  id: string;
  profileId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  truckId: string;
  tripId?: string; // Optional link to a specific Trip
  isReimbursable?: boolean; // Paid on behalf of client company (added to Trip Balance Due)
  category: ExpenseCategory;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface DriverPayment {
  id: string;
  profileId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  driverId: string;
  type: DriverPaymentType; // SALARY_PAYOUT or DRIVER_EXPENSE
  amount: number;
  paymentMethod?: string;
  description: string;
}

export interface CompanySettlement {
  id: string;
  profileId: string;
  date: string; // ISO date 'YYYY-MM-DD'
  companyId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export type DateFilterPreset = 'all' | 'this_month' | 'last_month' | 'custom';

export interface DateFilterState {
  preset: DateFilterPreset;
  startDate?: string;
  endDate?: string;
}

export interface FleetSummaryMetrics {
  totalRevenue: number;
  totalCompanyReceivables: number;
  netDriverPayable: number;
  fleetProfit: number;
  totalDirectExpenses: number;
  totalTripsCount: number;
  totalTdsDeducted: number;
  tripsWithTdsCount: number;
}

export type UniversalLedgerType = 'TRIP' | 'TRUCK_EXPENSE' | 'DRIVER_PAYMENT' | 'COMPANY_SETTLEMENT';
