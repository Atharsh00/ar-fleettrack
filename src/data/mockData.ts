import { Profile, SystemRules, Truck, Company, Driver, Trip, TruckExpense, DriverPayment, CompanySettlement } from '../types';

const getRelativeDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const initialProfiles: Profile[] = [
  { id: 'prof-1', name: 'Apex Logistics India', isDefault: true, createdAt: '2026-01-01' },
  { id: 'prof-2', name: 'Kiran Roadways Enterprise', isDefault: false, createdAt: '2026-02-15' },
];

export const initialRules: Record<string, SystemRules> = {
  'prof-1': { defaultDriverSalaryPercent: 15, defaultTdsPercent: 1 },
  'prof-2': { defaultDriverSalaryPercent: 15, defaultTdsPercent: 1 },
};

export const initialTrucks: Truck[] = [
  // Profile 1
  { id: 'trk-1', profileId: 'prof-1', registrationNumber: 'MH-12-RN-4825', model: 'Tata Signa 4825.TK', capacity: '28 Ton', status: 'ACTIVE' },
  { id: 'trk-2', profileId: 'prof-1', registrationNumber: 'MH-14-GH-3518', model: 'BharatBenz 3528C', capacity: '22 Ton', status: 'ACTIVE' },
  { id: 'trk-3', profileId: 'prof-1', registrationNumber: 'DL-01-AX-9012', model: 'Ashok Leyland 4220', capacity: '26 Ton', status: 'ACTIVE' },
  { id: 'trk-4', profileId: 'prof-1', registrationNumber: 'KA-04-MB-7711', model: 'Eicher Pro 6028', capacity: '20 Ton', status: 'IN_MAINTENANCE' },
  // Profile 2
  { id: 'trk-5', profileId: 'prof-2', registrationNumber: 'GJ-06-KK-1199', model: 'Volvo FMX 460', capacity: '32 Ton', status: 'ACTIVE' },
  { id: 'trk-6', profileId: 'prof-2', registrationNumber: 'RJ-14-TY-8833', model: 'Tata Prima 5530.S', capacity: '40 Ton', status: 'ACTIVE' },
];

export const initialCompanies: Company[] = [
  // Profile 1
  { id: 'cmp-1', profileId: 'prof-1', name: 'LogiXpress Logistics Ltd', contactPerson: 'Rajesh Sharma', phone: '+91 98220 11223', email: 'rajesh@logixpress.com' },
  { id: 'cmp-2', profileId: 'prof-1', name: 'Shree Cement Carriers', contactPerson: 'Anil Gupta', phone: '+91 98110 44556', email: 'dispatch@shreecement.com' },
  { id: 'cmp-3', profileId: 'prof-1', name: 'Tata Steel Supply Chain', contactPerson: 'Vikram Verma', phone: '+91 98330 99887', email: 'freight@tatasteel.com' },
  { id: 'cmp-4', profileId: 'prof-1', name: 'Amazon Relay Partner Ops', contactPerson: 'Pooja Iyer', phone: '+91 98440 22334', email: 'relay-ops@amazon.in' },
  // Profile 2
  { id: 'cmp-5', profileId: 'prof-2', name: 'Adani Ports Logistics', contactPerson: 'Suresh Patel', phone: '+91 98990 12345', email: 'ops@adaniports.com' },
  { id: 'cmp-6', profileId: 'prof-2', name: 'Ultratech Cement Fleet', contactPerson: 'Ramanathan', phone: '+91 98770 54321', email: 'logistics@ultratech.com' },
];

export const initialDrivers: Driver[] = [
  // Profile 1
  { id: 'drv-1', profileId: 'prof-1', name: 'Ramesh Yadav', phone: '+91 97110 12345', licenseNumber: 'MH-12-201500892', status: 'ACTIVE' },
  { id: 'drv-2', profileId: 'prof-1', name: 'Sukhvinder Singh', phone: '+91 98220 54321', licenseNumber: 'PB-10-201200114', status: 'ACTIVE' },
  { id: 'drv-3', profileId: 'prof-1', name: 'Manoj Kumar', phone: '+91 99330 67890', licenseNumber: 'UP-14-201800983', status: 'ACTIVE' },
  { id: 'drv-4', profileId: 'prof-1', name: 'Balwant Patel', phone: '+91 96440 11229', licenseNumber: 'GJ-06-201700445', status: 'ACTIVE' },
  // Profile 2
  { id: 'drv-5', profileId: 'prof-2', name: 'Harpreet Singh', phone: '+91 97550 88221', licenseNumber: 'HR-02-201600321', status: 'ACTIVE' },
  { id: 'drv-6', profileId: 'prof-2', name: 'Dharmendra Joshi', phone: '+91 97660 44990', licenseNumber: 'RJ-14-201900774', status: 'ACTIVE' },
];

export const initialTrips: Trip[] = [
  // Profile 1 Trips
  {
    id: 'trp-1',
    profileId: 'prof-1',
    date: getRelativeDate(2),
    truckId: 'trk-1',
    companyId: 'cmp-1',
    driverId: 'drv-1',
    fromLocation: 'Mumbai JNPT',
    toLocation: 'Solapur MIDC',
    additionalDrops: ['Pune Chakan'],
    route: 'Mumbai JNPT -> Pune Chakan -> Solapur MIDC',
    totalRent: 50000,
    commissionAmount: 1000, // broker commission
    isTdsDeducted: true,
    tdsPercent: 1,
    tdsAmount: 500, // 1% of 50000
    netRent: 48500, // 50000 - 500 - 1000
    driverCommissionPercent: 15,
    driverCommission: 7275, // 15% of 48500
    advanceReceived: 20000,
    balancePending: 28500, // 50000 - 20000 - 1000 - 500
    status: 'COMPLETED',
    notes: 'Industrial parts delivered, 1 drop completed in Pune',
  },
  {
    id: 'trp-2',
    profileId: 'prof-1',
    date: getRelativeDate(5),
    truckId: 'trk-2',
    companyId: 'cmp-2',
    driverId: 'drv-2',
    fromLocation: 'Nagpur Yard',
    toLocation: 'Surat Ring Road',
    additionalDrops: [],
    route: 'Nagpur Yard -> Surat Ring Road',
    totalRent: 60000,
    commissionAmount: 0,
    isTdsDeducted: true,
    tdsPercent: 1,
    tdsAmount: 600, // 1% of 60000
    netRent: 59400, // 60000 - 600
    driverCommissionPercent: 15,
    driverCommission: 8910, // 15% of 59400
    advanceReceived: 35000,
    balancePending: 24400, // 60000 - 35000 - 0 - 600
    status: 'COMPLETED',
    notes: 'Cement bags cargo, weighbridge verified',
  },
  {
    id: 'trp-3',
    profileId: 'prof-1',
    date: getRelativeDate(8),
    truckId: 'trk-3',
    companyId: 'cmp-3',
    driverId: 'drv-3',
    fromLocation: 'Jamshedpur Tisco',
    toLocation: 'Delhi NCR',
    additionalDrops: ['Varanasi Hub'],
    route: 'Jamshedpur Tisco -> Varanasi Hub -> Delhi NCR',
    totalRent: 85000,
    commissionAmount: 2000,
    isTdsDeducted: false,
    tdsPercent: 1,
    tdsAmount: 0,
    netRent: 83000, // 85000 - 0 - 2000
    driverCommissionPercent: 15,
    driverCommission: 12450, // 15% of 83000
    advanceReceived: 50000,
    balancePending: 33000, // 85000 - 50000 - 2000 - 0
    status: 'COMPLETED',
    notes: 'Heavy steel coils',
  },
  {
    id: 'trp-4',
    profileId: 'prof-1',
    date: getRelativeDate(12),
    truckId: 'trk-1',
    companyId: 'cmp-4',
    driverId: 'drv-1',
    fromLocation: 'Bhiwandi Hub',
    toLocation: 'Bengaluru DC',
    additionalDrops: ['Belgaum Bypass'],
    route: 'Bhiwandi Hub -> Belgaum Bypass -> Bengaluru DC',
    totalRent: 72000,
    commissionAmount: 1500,
    isTdsDeducted: true,
    tdsPercent: 1,
    tdsAmount: 720,
    netRent: 69780,
    driverCommissionPercent: 15,
    driverCommission: 10467,
    advanceReceived: 40000,
    balancePending: 29780, // 72000 - 40000 - 1500 - 720
    status: 'COMPLETED',
    notes: 'E-commerce FMCG parcel delivery',
  },
  {
    id: 'trp-5',
    profileId: 'prof-1',
    date: getRelativeDate(35),
    truckId: 'trk-2',
    companyId: 'cmp-1',
    driverId: 'drv-2',
    fromLocation: 'Pune MIDC',
    toLocation: 'Hyderabad Hub',
    additionalDrops: [],
    route: 'Pune MIDC -> Hyderabad Hub',
    totalRent: 50000,
    commissionAmount: 1000,
    isTdsDeducted: true,
    tdsPercent: 1,
    tdsAmount: 500,
    netRent: 48500,
    driverCommissionPercent: 15,
    driverCommission: 7275,
    advanceReceived: 30000,
    balancePending: 18500, // 50000 - 30000 - 1000 - 500
    status: 'COMPLETED',
    notes: 'Auto parts shipment',
  },
  // Profile 2 Trips
  {
    id: 'trp-6',
    profileId: 'prof-2',
    date: getRelativeDate(3),
    truckId: 'trk-5',
    companyId: 'cmp-5',
    driverId: 'drv-5',
    fromLocation: 'Mundra Port',
    toLocation: 'Jaipur Depot',
    additionalDrops: ['Ahmedabad Yard'],
    route: 'Mundra Port -> Ahmedabad Yard -> Jaipur Depot',
    totalRent: 95000,
    commissionAmount: 2500,
    isTdsDeducted: true,
    tdsPercent: 1,
    tdsAmount: 950,
    netRent: 91550,
    driverCommissionPercent: 15,
    driverCommission: 13732.5,
    advanceReceived: 60000,
    balancePending: 31550, // 95000 - 60000 - 2500 - 950
    status: 'COMPLETED',
    notes: 'Containerized cargo',
  },
];

export const initialTruckExpenses: TruckExpense[] = [
  // Profile 1
  { id: 'exp-1', profileId: 'prof-1', date: getRelativeDate(1), truckId: 'trk-1', category: 'DIESEL', amount: 16500, paymentMethod: 'Fleet Card', notes: 'Diesel 180L IOCL Highway' },
  { id: 'exp-2', profileId: 'prof-1', date: getRelativeDate(3), truckId: 'trk-1', category: 'TOLL', amount: 2800, paymentMethod: 'FASTag', notes: 'Expressway tolls' },
  { id: 'exp-3', profileId: 'prof-1', date: getRelativeDate(4), truckId: 'trk-2', category: 'DIESEL', amount: 21000, paymentMethod: 'Fleet Card', notes: 'Diesel 240L BPCL' },
  { id: 'exp-4', profileId: 'prof-1', date: getRelativeDate(6), truckId: 'trk-2', category: 'MAINTENANCE', amount: 4500, paymentMethod: 'UPI', notes: 'Brake liner adjustment' },
  { id: 'exp-5', profileId: 'prof-1', date: getRelativeDate(7), truckId: 'trk-3', category: 'DIESEL', amount: 32000, paymentMethod: 'Fleet Card', notes: 'Highway fuel bulk recharge' },
  { id: 'exp-6', profileId: 'prof-1', date: getRelativeDate(9), truckId: 'trk-3', category: 'TOLL', amount: 4200, paymentMethod: 'FASTag', notes: 'FASTag toll charges' },
  { id: 'exp-7', profileId: 'prof-1', date: getRelativeDate(14), truckId: 'trk-4', category: 'SPARE_PARTS', amount: 12500, paymentMethod: 'Bank Transfer', notes: 'New alternator & battery' },
  // Profile 2
  { id: 'exp-8', profileId: 'prof-2', date: getRelativeDate(2), truckId: 'trk-5', category: 'DIESEL', amount: 28000, paymentMethod: 'Fleet Card', notes: 'Port exit diesel fill' },
  { id: 'exp-9', profileId: 'prof-2', date: getRelativeDate(4), truckId: 'trk-5', category: 'TOLL', amount: 3800, paymentMethod: 'FASTag', notes: 'National Highway tolls' },
];

export const initialDriverPayments: DriverPayment[] = [
  // Profile 1
  { id: 'dp-1', profileId: 'prof-1', date: getRelativeDate(3), driverId: 'drv-1', type: 'SALARY_PAYOUT', amount: 10000, paymentMethod: 'UPI', description: 'Weekly advance cash payment' },
  { id: 'dp-2', profileId: 'prof-1', date: getRelativeDate(2), driverId: 'drv-1', type: 'DRIVER_EXPENSE', amount: 1200, description: 'Emergency puncture repair & DEF fluid' },
  { id: 'dp-3', profileId: 'prof-1', date: getRelativeDate(6), driverId: 'drv-2', type: 'SALARY_PAYOUT', amount: 8000, paymentMethod: 'Cash', description: 'Advance handed at yard' },
  { id: 'dp-4', profileId: 'prof-1', date: getRelativeDate(5), driverId: 'drv-2', type: 'DRIVER_EXPENSE', amount: 850, description: 'RTO weighbridge fee & parking' },
  { id: 'dp-5', profileId: 'prof-1', date: getRelativeDate(10), driverId: 'drv-3', type: 'SALARY_PAYOUT', amount: 12000, paymentMethod: 'Bank Transfer', description: 'Monthly driver advance' },
  // Profile 2
  { id: 'dp-6', profileId: 'prof-2', date: getRelativeDate(2), driverId: 'drv-5', type: 'SALARY_PAYOUT', amount: 15000, paymentMethod: 'UPI', description: 'Long haul advance payout' },
];

export const initialCompanySettlements: CompanySettlement[] = [
  // Profile 1
  { id: 'set-1', profileId: 'prof-1', date: getRelativeDate(10), companyId: 'cmp-1', amount: 15000, paymentMethod: 'NEFT', referenceNumber: 'NEFT99238472', notes: 'Cleared part of Pune trip invoice' },
  { id: 'set-2', profileId: 'prof-1', date: getRelativeDate(38), companyId: 'cmp-2', amount: 10000, paymentMethod: 'Cheque', referenceNumber: 'CHQ-882103', notes: 'Settlement for previous trips' },
  // Profile 2
  { id: 'set-3', profileId: 'prof-2', date: getRelativeDate(1), companyId: 'cmp-5', amount: 20000, paymentMethod: 'RTGS', referenceNumber: 'RTGS441199', notes: 'Port clearance settlement' },
];
