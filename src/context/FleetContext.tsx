import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Profile,
  SystemRules,
  Truck,
  Company,
  Driver,
  Trip,
  TruckExpense,
  DriverPayment,
  CompanySettlement,
  DateFilterState,
  FleetSummaryMetrics,
  ExpenseCategory,
  DriverPaymentType,
} from '../types';
import {
  initialProfiles,
  initialRules,
  initialTrucks,
  initialCompanies,
  initialDrivers,
  initialTrips,
  initialTruckExpenses,
  initialDriverPayments,
  initialCompanySettlements,
} from '../data/mockData';

export interface AddTripInput {
  date: string;
  truckId: string;
  companyNameOrId: string;
  driverNameOrId: string;
  fromLocation: string;
  toLocation: string;
  additionalDrops: string[];
  totalRent: number;
  commissionAmount: number;
  isTdsDeducted: boolean;
  advanceReceived: number;
  notes?: string;
}

export interface AddExpenseInput {
  date: string;
  truckId: string;
  tripId?: string; // Optional link to a specific Trip
  isReimbursable?: boolean; // Paid on behalf of client company
  category: ExpenseCategory;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface AddDriverPaymentInput {
  date: string;
  driverId: string;
  type: DriverPaymentType;
  amount: number;
  paymentMethod?: string;
  description: string;
}

export interface AddSettlementInput {
  date: string;
  companyId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface CompanyAccountSummary {
  company: Company;
  totalContracted: number;
  totalAdvanceReceived: number;
  totalCommissions: number;
  totalTdsDeducted: number;
  totalReimbursable: number;
  totalSettlementsReceived: number;
  totalReceived: number;
  balanceDue: number;
  tripsCount: number;
}

export interface DriverAccountSummary {
  driver: Driver;
  totalSalaryEarned: number; // Sum of driverCommission (15% of Net Rent)
  totalPayoutsMade: number;  // SALARY_PAYOUT
  totalDriverExpenses: number; // DRIVER_EXPENSE
  netBalanceDue: number;     // (totalSalaryEarned + totalDriverExpenses) - totalPayoutsMade
  tripsCount: number;
}

export interface TruckPerformanceSummary {
  truck: Truck;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  tripsCount: number;
  expensesByCategory: Record<ExpenseCategory, number>;
}

interface FleetContextType {
  // Profiles
  profiles: Profile[];
  activeProfileId: string;
  activeProfile: Profile;
  setActiveProfileId: (id: string) => void;
  addProfile: (name: string) => Profile;
  updateProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;

  // Rules
  activeRules: SystemRules;
  updateRules: (newRules: Partial<SystemRules>) => void;

  // Master Data (Scoped to active profile)
  trucks: Truck[];
  companies: Company[];
  drivers: Driver[];
  trips: Trip[];
  truckExpenses: TruckExpense[];
  driverPayments: DriverPayment[];
  companySettlements: CompanySettlement[];
  dateFilter: DateFilterState;
  currency: string; // Exclusively '₹'

  // Actions
  setDateFilter: (filter: DateFilterState) => void;
  addTrip: (input: AddTripInput) => Trip;
  updateTrip: (id: string, input: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  addTruckExpense: (input: AddExpenseInput) => TruckExpense;
  updateTruckExpense: (id: string, input: Partial<TruckExpense>) => void;
  deleteTruckExpense: (id: string) => void;

  addDriverPayment: (input: AddDriverPaymentInput) => DriverPayment;
  updateDriverPayment: (id: string, input: Partial<DriverPayment>) => void;
  deleteDriverPayment: (id: string) => void;

  addCompanySettlement: (input: AddSettlementInput) => CompanySettlement;
  updateCompanySettlement: (id: string, input: Partial<CompanySettlement>) => void;
  deleteCompanySettlement: (id: string) => void;

  // Master Entity Management
  addTruck: (truck: Omit<Truck, 'id' | 'profileId'>) => Truck;
  updateTruck: (id: string, fields: Partial<Truck>) => void;
  deleteTruck: (id: string) => void;

  addCompany: (input: { name: string; contactPerson?: string; phone?: string; email?: string; gstin?: string } | string, contactPerson?: string, phone?: string, email?: string, gstin?: string) => Company;
  updateCompany: (id: string, fields: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  addDriver: (input: { name: string; phone: string; licenseNumber: string; joiningDate?: string; status?: DriverStatus } | string, phone?: string, licenseNumber?: string, joiningDate?: string) => Driver;
  updateDriver: (id: string, fields: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  getTruckReg: (idOrReg: string) => string;
  getCompanyName: (idOrName: string) => string;
  getDriverName: (idOrName: string) => string;
  getTripExpenses: (tripId: string) => number;
  getTripReimbursable: (tripId: string) => number;
  getTripBalancePending: (trip: Trip) => number;
  getTripProfit: (trip: Trip) => number;

  // Filtered Lists & Metrics (Scoped to active profile & date filter)
  filteredTrips: Trip[];
  filteredTruckExpenses: TruckExpense[];
  filteredDriverPayments: DriverPayment[];
  filteredCompanySettlements: CompanySettlement[];
  summaryMetrics: FleetSummaryMetrics;
  companyAccounts: CompanyAccountSummary[];
  driverAccounts: DriverAccountSummary[];
  truckPerformanceList: TruckPerformanceSummary[];
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const STORAGE_PREFIX = 'fleet_v2';

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_profiles`);
    return saved ? JSON.parse(saved) : initialProfiles;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_active_prof`);
    return saved && profiles.some((p) => p.id === saved) ? saved : profiles[0]?.id || 'prof-1';
  });

  // System Rules per profile
  const [rules, setRules] = useState<Record<string, SystemRules>>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_rules`);
    return saved ? JSON.parse(saved) : initialRules;
  });

  // All entities (across profiles)
  const [allTrucks, setAllTrucks] = useState<Truck[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_trucks`);
    return saved ? JSON.parse(saved) : initialTrucks;
  });

  const [allCompanies, setAllCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_companies`);
    return saved ? JSON.parse(saved) : initialCompanies;
  });

  const [allDrivers, setAllDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_drivers`);
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [allTrips, setAllTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_trips`);
    return saved ? JSON.parse(saved) : initialTrips;
  });

  const [allExpenses, setAllExpenses] = useState<TruckExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_expenses`);
    return saved ? JSON.parse(saved) : initialTruckExpenses;
  });

  const [allDriverPayments, setAllDriverPayments] = useState<DriverPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_driver_payments`);
    return saved ? JSON.parse(saved) : initialDriverPayments;
  });

  const [allSettlements, setAllSettlements] = useState<CompanySettlement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}_settlements`);
    return saved ? JSON.parse(saved) : initialCompanySettlements;
  });

  const [dateFilter, setDateFilter] = useState<DateFilterState>({ preset: 'all' });
  const currency = '₹'; // Exclusively INR

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_profiles`, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_active_prof`, activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_rules`, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_trucks`, JSON.stringify(allTrucks));
  }, [allTrucks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_companies`, JSON.stringify(allCompanies));
  }, [allCompanies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_drivers`, JSON.stringify(allDrivers));
  }, [allDrivers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_trips`, JSON.stringify(allTrips));
  }, [allTrips]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_expenses`, JSON.stringify(allExpenses));
  }, [allExpenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_driver_payments`, JSON.stringify(allDriverPayments));
  }, [allDriverPayments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_settlements`, JSON.stringify(allSettlements));
  }, [allSettlements]);

  // Active Profile & Rules
  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || { id: 'prof-1', name: 'Default Entity', createdAt: '' };
  }, [profiles, activeProfileId]);

  const activeRules: SystemRules = useMemo(() => {
    return rules[activeProfileId] || { defaultDriverSalaryPercent: 15, defaultTdsPercent: 1 };
  }, [rules, activeProfileId]);

  const updateRules = (newRules: Partial<SystemRules>) => {
    setRules((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...(prev[activeProfileId] || { defaultDriverSalaryPercent: 15, defaultTdsPercent: 1 }),
        ...newRules,
      },
    }));
  };

  // Profile Management
  const addProfile = (name: string): Profile => {
    const newProf: Profile = {
      id: `prof-${Date.now()}`,
      name: name.trim(),
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProfiles((prev) => [...prev, newProf]);
    setRules((prev) => ({
      ...prev,
      [newProf.id]: { defaultDriverSalaryPercent: 15, defaultTdsPercent: 1 },
    }));
    setActiveProfileId(newProf.id);
    return newProf;
  };

  const updateProfile = (id: string, name: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the only remaining profile.');
      return;
    }
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    setActiveProfileId(remaining[0].id);

    // Clean up scoped records
    setAllTrucks((prev) => prev.filter((t) => t.profileId !== id));
    setAllCompanies((prev) => prev.filter((c) => c.profileId !== id));
    setAllDrivers((prev) => prev.filter((d) => d.profileId !== id));
    setAllTrips((prev) => prev.filter((t) => t.profileId !== id));
    setAllExpenses((prev) => prev.filter((e) => e.profileId !== id));
    setAllDriverPayments((prev) => prev.filter((p) => p.profileId !== id));
    setAllSettlements((prev) => prev.filter((s) => s.profileId !== id));
  };

  // Scoped Data by Active Profile
  const trucks = useMemo(() => allTrucks.filter((t) => t.profileId === activeProfileId), [allTrucks, activeProfileId]);
  const companies = useMemo(() => allCompanies.filter((c) => c.profileId === activeProfileId), [allCompanies, activeProfileId]);
  const drivers = useMemo(() => allDrivers.filter((d) => d.profileId === activeProfileId), [allDrivers, activeProfileId]);
  const trips = useMemo(() => allTrips.filter((t) => t.profileId === activeProfileId), [allTrips, activeProfileId]);
  const truckExpenses = useMemo(() => allExpenses.filter((e) => e.profileId === activeProfileId), [allExpenses, activeProfileId]);
  const driverPayments = useMemo(() => allDriverPayments.filter((p) => p.profileId === activeProfileId), [allDriverPayments, activeProfileId]);
  const companySettlements = useMemo(() => allSettlements.filter((s) => s.profileId === activeProfileId), [allSettlements, activeProfileId]);

  // Date Filter Logic
  const isDateInRange = (dateStr: string): boolean => {
    if (dateFilter.preset === 'all') return true;
    const targetDate = new Date(dateStr);
    const now = new Date();

    if (dateFilter.preset === 'this_month') {
      return targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() === now.getMonth();
    }
    if (dateFilter.preset === 'last_month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return targetDate.getFullYear() === prevMonth.getFullYear() && targetDate.getMonth() === prevMonth.getMonth();
    }
    if (dateFilter.preset === 'custom') {
      if (dateFilter.startDate && dateFilter.endDate) {
        return dateStr >= dateFilter.startDate && dateStr <= dateFilter.endDate;
      } else if (dateFilter.startDate) {
        return dateStr >= dateFilter.startDate;
      } else if (dateFilter.endDate) {
        return dateStr <= dateFilter.endDate;
      }
      return true;
    }
    return true;
  };

  // Filtered Datasets based on Date Filter
  const filteredTrips = useMemo(() => trips.filter((t) => isDateInRange(t.date)), [trips, dateFilter]);
  const filteredTruckExpenses = useMemo(() => truckExpenses.filter((e) => isDateInRange(e.date)), [truckExpenses, dateFilter]);
  const filteredDriverPayments = useMemo(() => driverPayments.filter((p) => isDateInRange(p.date)), [driverPayments, dateFilter]);
  const filteredCompanySettlements = useMemo(() => companySettlements.filter((s) => isDateInRange(s.date)), [companySettlements, dateFilter]);

  // Aggregated Summary Metrics (Scoped)
  const summaryMetrics: FleetSummaryMetrics = useMemo(() => {
    const totalRevenue = filteredTrips.reduce((sum, t) => sum + t.totalRent, 0);
    const totalDirectExpenses = filteredTruckExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Company Receivables across filtered range:
    // (Total Pending Rent from trips including reimbursables) - (Settlements received in period)
    const totalPendingRentFromTrips = filteredTrips.reduce((sum, t) => sum + getTripBalancePending(t), 0);
    const totalSettlementsInPeriod = filteredCompanySettlements.reduce((sum, s) => sum + s.amount, 0);
    const totalCompanyReceivables = Math.max(0, totalPendingRentFromTrips - totalSettlementsInPeriod);

    // Driver Net Payable:
    // Commissions + driver out-of-pocket expenses - payouts
    const totalDriverCommissions = filteredTrips.reduce((sum, t) => sum + t.driverCommission, 0);
    const totalDriverExpensesIncurred = filteredDriverPayments
      .filter((p) => p.type === 'DRIVER_EXPENSE')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalDriverPayouts = filteredDriverPayments
      .filter((p) => p.type === 'SALARY_PAYOUT')
      .reduce((sum, p) => sum + p.amount, 0);
    const netDriverPayable = (totalDriverCommissions + totalDriverExpensesIncurred) - totalDriverPayouts;

    // Fleet Net Profit = Revenue - Direct Truck Expenses - Driver Commission
    const fleetProfit = totalRevenue - totalDirectExpenses - totalDriverCommissions;

    // TDS metrics
    const totalTdsDeducted = filteredTrips.reduce((sum, t) => sum + (t.tdsAmount || 0), 0);
    const tripsWithTdsCount = filteredTrips.filter((t) => t.isTdsDeducted && (t.tdsAmount || 0) > 0).length;

    return {
      totalRevenue,
      totalCompanyReceivables,
      netDriverPayable,
      fleetProfit,
      totalDirectExpenses,
      totalTripsCount: filteredTrips.length,
      totalTdsDeducted,
      tripsWithTdsCount,
    };
  }, [filteredTrips, filteredTruckExpenses, filteredDriverPayments, filteredCompanySettlements, allExpenses]);

  // Company Accounts Ledger
  const companyAccounts: CompanyAccountSummary[] = useMemo(() => {
    return companies.map((company) => {
      const companyTrips = filteredTrips.filter((t) => t.companyId === company.id);
      const companySettles = filteredCompanySettlements.filter((s) => s.companyId === company.id);

      const totalContracted = companyTrips.reduce((sum, t) => sum + t.totalRent, 0);
      const totalAdvanceReceived = companyTrips.reduce((sum, t) => sum + t.advanceReceived, 0);
      const totalCommissions = companyTrips.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
      const totalTdsDeducted = companyTrips.reduce((sum, t) => sum + (t.tdsAmount || 0), 0);
      const totalReimbursable = companyTrips.reduce((sum, t) => sum + getTripReimbursable(t.id), 0);
      const totalSettlementsReceived = companySettles.reduce((sum, s) => sum + s.amount, 0);
      const totalReceived = totalAdvanceReceived + totalSettlementsReceived;
      
      // Balance due accounts for reimbursable expenses added, and broker commission and TDS withheld by company
      const balanceDue = Math.max(0, totalContracted + totalReimbursable - totalReceived - totalCommissions - totalTdsDeducted);

      return {
        company,
        totalContracted,
        totalAdvanceReceived,
        totalCommissions,
        totalTdsDeducted,
        totalReimbursable,
        totalSettlementsReceived,
        totalReceived,
        balanceDue,
        tripsCount: companyTrips.length,
      };
    });
  }, [companies, filteredTrips, filteredCompanySettlements, allExpenses]);

  // Driver Accounts Ledger
  const driverAccounts: DriverAccountSummary[] = useMemo(() => {
    return drivers.map((driver) => {
      const dTrips = filteredTrips.filter((t) => t.driverId === driver.id);
      const dPayments = filteredDriverPayments.filter((p) => p.driverId === driver.id);

      const totalSalaryEarned = dTrips.reduce((sum, t) => sum + t.driverCommission, 0);
      const totalPayoutsMade = dPayments
        .filter((p) => p.type === 'SALARY_PAYOUT')
        .reduce((sum, p) => sum + p.amount, 0);
      const totalDriverExpenses = dPayments
        .filter((p) => p.type === 'DRIVER_EXPENSE')
        .reduce((sum, p) => sum + p.amount, 0);

      const netBalanceDue = (totalSalaryEarned + totalDriverExpenses) - totalPayoutsMade;

      return {
        driver,
        totalSalaryEarned,
        totalPayoutsMade,
        totalDriverExpenses,
        netBalanceDue,
        tripsCount: dTrips.length,
      };
    });
  }, [drivers, filteredTrips, filteredDriverPayments]);

  // Truck Performance Summaries
  const truckPerformanceList: TruckPerformanceSummary[] = useMemo(() => {
    return trucks.map((truck) => {
      const tTrips = filteredTrips.filter((t) => t.truckId === truck.id);
      const tExpenses = filteredTruckExpenses.filter((e) => e.truckId === truck.id);

      const totalRevenue = tTrips.reduce((sum, t) => sum + t.totalRent, 0);
      const totalExpenses = tExpenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const expensesByCategory: Record<ExpenseCategory, number> = {
        DIESEL: 0,
        MAINTENANCE: 0,
        TOLL: 0,
        INSURANCE: 0,
        PERMITS: 0,
        SPARE_PARTS: 0,
        OTHER: 0,
      };

      tExpenses.forEach((exp) => {
        if (expensesByCategory[exp.category] !== undefined) {
          expensesByCategory[exp.category] += exp.amount;
        } else {
          expensesByCategory.OTHER += exp.amount;
        }
      });

      return {
        truck,
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMarginPercent,
        tripsCount: tTrips.length,
        expensesByCategory,
      };
    });
  }, [trucks, filteredTrips, filteredTruckExpenses]);

  // Helpers to auto-create Company or Driver scoped to active profile
  const ensureCompany = (companyNameOrId: string): Company => {
    const existing = companies.find(
      (c) => c.id === companyNameOrId || c.name.toLowerCase() === companyNameOrId.trim().toLowerCase()
    );
    if (existing) return existing;

    const newCompany: Company = {
      id: `cmp-${Date.now()}`,
      profileId: activeProfileId,
      name: companyNameOrId.trim(),
    };
    setAllCompanies((prev) => [...prev, newCompany]);
    return newCompany;
  };

  const ensureDriver = (driverNameOrId: string): Driver => {
    const existing = drivers.find(
      (d) => d.id === driverNameOrId || d.name.toLowerCase() === driverNameOrId.trim().toLowerCase()
    );
    if (existing) return existing;

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      profileId: activeProfileId,
      name: driverNameOrId.trim(),
      phone: 'Pending',
      licenseNumber: 'Pending',
      status: 'ACTIVE',
    };
    setAllDrivers((prev) => [...prev, newDriver]);
    return newDriver;
  };

  // Helper to recompute trip financial fields accurately
  const computeTripFinancials = (
    totalRent: number,
    commissionAmount: number,
    isTdsDeducted: boolean,
    advanceReceived: number,
    tdsPercent = activeRules.defaultTdsPercent,
    driverCommPercent = activeRules.defaultDriverSalaryPercent
  ) => {
    const tdsAmount = isTdsDeducted ? (totalRent * (tdsPercent / 100)) : 0;
    const netRent = Math.max(0, totalRent - tdsAmount - commissionAmount);
    const driverCommission = netRent * (driverCommPercent / 100);
    const balancePending = Math.max(0, totalRent - advanceReceived - commissionAmount - tdsAmount);

    return {
      tdsPercent,
      tdsAmount,
      netRent,
      driverCommissionPercent: driverCommPercent,
      driverCommission,
      balancePending,
    };
  };

  // Actions: Trips
  const addTrip = (input: AddTripInput): Trip => {
    const company = ensureCompany(input.companyNameOrId);
    const driver = ensureDriver(input.driverNameOrId);

    const totalRent = Number(input.totalRent) || 0;
    const commissionAmount = Number(input.commissionAmount) || 0;
    const advanceReceived = Number(input.advanceReceived) || 0;
    const isTdsDeducted = Boolean(input.isTdsDeducted);

    const financials = computeTripFinancials(
      totalRent,
      commissionAmount,
      isTdsDeducted,
      advanceReceived,
      activeRules.defaultTdsPercent,
      activeRules.defaultDriverSalaryPercent
    );

    const stops = (input.additionalDrops || []).filter(Boolean);
    const formattedRoute = [input.fromLocation, ...stops, input.toLocation].filter(Boolean).join(' -> ');

    const newTrip: Trip = {
      id: `trp-${Date.now()}`,
      profileId: activeProfileId,
      date: input.date,
      truckId: input.truckId,
      companyId: company.id,
      driverId: driver.id,
      fromLocation: input.fromLocation.trim(),
      toLocation: input.toLocation.trim(),
      additionalDrops: stops,
      route: formattedRoute || 'General Freight',
      totalRent,
      commissionAmount,
      isTdsDeducted,
      advanceReceived,
      ...financials,
      status: 'COMPLETED',
      notes: input.notes,
    };

    setAllTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setAllTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== id) return trip;

        const merged: Trip = { ...trip, ...updates };
        const totalRent = Number(merged.totalRent) || 0;
        const commissionAmount = Number(merged.commissionAmount) || 0;
        const advanceReceived = Number(merged.advanceReceived) || 0;
        const isTdsDeducted = Boolean(merged.isTdsDeducted);

        const financials = computeTripFinancials(
          totalRent,
          commissionAmount,
          isTdsDeducted,
          advanceReceived,
          merged.tdsPercent || activeRules.defaultTdsPercent,
          merged.driverCommissionPercent || activeRules.defaultDriverSalaryPercent
        );

        const stops = (merged.additionalDrops || []).filter(Boolean);
        const formattedRoute = [merged.fromLocation, ...stops, merged.toLocation].filter(Boolean).join(' -> ');

        return {
          ...merged,
          route: formattedRoute || merged.route,
          ...financials,
        };
      })
    );
  };

  const deleteTrip = (id: string) => {
    setAllTrips((prev) => prev.filter((t) => t.id !== id));
  };

  // Actions: Expenses
  const addTruckExpense = (input: AddExpenseInput): TruckExpense => {
    const newExpense: TruckExpense = {
      id: `exp-${Date.now()}`,
      profileId: activeProfileId,
      date: input.date,
      truckId: input.truckId,
      tripId: input.tripId || undefined,
      isReimbursable: Boolean(input.isReimbursable),
      category: input.category,
      amount: Number(input.amount) || 0,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
    };

    setAllExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const updateTruckExpense = (id: string, updates: Partial<TruckExpense>) => {
    setAllExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updates, amount: Number(updates.amount ?? exp.amount) } : exp))
    );
  };

  const deleteTruckExpense = (id: string) => {
    setAllExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Actions: Driver Payments
  const addDriverPayment = (input: AddDriverPaymentInput): DriverPayment => {
    const newPayment: DriverPayment = {
      id: `dp-${Date.now()}`,
      profileId: activeProfileId,
      date: input.date,
      driverId: input.driverId,
      type: input.type,
      amount: Number(input.amount) || 0,
      paymentMethod: input.paymentMethod,
      description: input.description,
    };

    setAllDriverPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const updateDriverPayment = (id: string, updates: Partial<DriverPayment>) => {
    setAllDriverPayments((prev) =>
      prev.map((dp) => (dp.id === id ? { ...dp, ...updates, amount: Number(updates.amount ?? dp.amount) } : dp))
    );
  };

  const deleteDriverPayment = (id: string) => {
    setAllDriverPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Actions: Company Settlements
  const addCompanySettlement = (input: AddSettlementInput): CompanySettlement => {
    const newSettlement: CompanySettlement = {
      id: `set-${Date.now()}`,
      profileId: activeProfileId,
      date: input.date,
      companyId: input.companyId,
      amount: Number(input.amount) || 0,
      paymentMethod: input.paymentMethod,
      referenceNumber: input.referenceNumber,
      notes: input.notes,
    };

    setAllSettlements((prev) => [newSettlement, ...prev]);
    return newSettlement;
  };

  const updateCompanySettlement = (id: string, updates: Partial<CompanySettlement>) => {
    setAllSettlements((prev) =>
      prev.map((st) => (st.id === id ? { ...st, ...updates, amount: Number(updates.amount ?? st.amount) } : st))
    );
  };

  const deleteCompanySettlement = (id: string) => {
    setAllSettlements((prev) => prev.filter((s) => s.id !== id));
  };

  // Helpers to resolve entity display names
  const getTruckReg = (idOrReg: string): string => {
    const found = trucks.find((t) => t.id === idOrReg || t.registrationNumber === idOrReg);
    return found ? found.registrationNumber : idOrReg;
  };

  const getCompanyName = (idOrName: string): string => {
    const found = companies.find((c) => c.id === idOrName || c.name === idOrName);
    return found ? found.name : idOrName;
  };

  const getDriverName = (idOrName: string): string => {
    const found = drivers.find((d) => d.id === idOrName || d.name === idOrName);
    return found ? found.name : idOrName;
  };

  const getTripExpenses = (tripId: string): number => {
    return allExpenses
      .filter((e) => e.tripId === tripId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getTripReimbursable = (tripId: string): number => {
    return allExpenses
      .filter((e) => e.tripId === tripId && e.isReimbursable)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getTripBalancePending = (trip: Trip): number => {
    const reimbursable = getTripReimbursable(trip.id);
    return Math.max(0, trip.totalRent + reimbursable - trip.advanceReceived - (trip.commissionAmount || 0) - (trip.tdsAmount || 0));
  };

  const getTripProfit = (trip: Trip): number => {
    // Non-reimbursable trip operating expenses reduce trip profit;
    // reimbursable expenses are pass-through paid on client's behalf and reimbursed, so they don't reduce fleet trip profit.
    const nonReimbursableExp = allExpenses
      .filter((e) => e.tripId === trip.id && !e.isReimbursable)
      .reduce((sum, e) => sum + e.amount, 0);
    return trip.totalRent - (trip.commissionAmount || 0) - (trip.tdsAmount || 0) - trip.driverCommission - nonReimbursableExp;
  };

  // Actions: Master Entity Management (with cascading updates across past logs)
  const addTruck = (truck: Omit<Truck, 'id' | 'profileId'>): Truck => {
    const newTruck: Truck = {
      ...truck,
      id: `trk-${Date.now()}`,
      profileId: activeProfileId,
      status: truck.status || 'ACTIVE',
    };
    setAllTrucks((prev) => [...prev, newTruck]);
    return newTruck;
  };

  const updateTruck = (id: string, fields: Partial<Truck>) => {
    const existing = allTrucks.find((t) => t.id === id);
    setAllTrucks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
    // If registration number changed, cascade to historical logs where truckId was recorded as old reg number
    if (existing && fields.registrationNumber && fields.registrationNumber !== existing.registrationNumber) {
      setAllTrips((prev) =>
        prev.map((trip) =>
          trip.truckId === existing.registrationNumber ? { ...trip, truckId: fields.registrationNumber! } : trip
        )
      );
      setAllExpenses((prev) =>
        prev.map((exp) =>
          exp.truckId === existing.registrationNumber ? { ...exp, truckId: fields.registrationNumber! } : exp
        )
      );
    }
  };

  const deleteTruck = (id: string) => {
    const truck = allTrucks.find((t) => t.id === id);
    const regNo = truck?.registrationNumber;
    const hasTrips = allTrips.some((t) => t.truckId === id || (regNo && t.truckId === regNo));
    const hasExpenses = allExpenses.some((e) => e.truckId === id || (regNo && e.truckId === regNo));
    if (hasTrips || hasExpenses) {
      if (!window.confirm(`This truck (${regNo || id}) has associated historical trips or direct expenses. Deleting it will also remove those associated entries. Do you wish to continue?`)) {
        return;
      }
      setAllTrips((prev) => prev.filter((t) => t.truckId !== id && (!regNo || t.truckId !== regNo)));
      setAllExpenses((prev) => prev.filter((e) => e.truckId !== id && (!regNo || e.truckId !== regNo)));
    }
    setAllTrucks((prev) => prev.filter((t) => t.id !== id));
  };

  const addCompany = (
    input: { name: string; contactPerson?: string; phone?: string; email?: string; gstin?: string } | string,
    contactPerson?: string,
    phone?: string,
    email?: string,
    gstin?: string
  ): Company => {
    const companyData = typeof input === 'string'
      ? { name: input, contactPerson, phone, email, gstin }
      : input;

    const newCompany: Company = {
      id: `cmp-${Date.now()}`,
      profileId: activeProfileId,
      name: companyData.name.trim(),
      contactPerson: companyData.contactPerson?.trim(),
      phone: companyData.phone?.trim(),
      email: companyData.email?.trim(),
      gstin: companyData.gstin?.trim(),
    };
    setAllCompanies((prev) => [...prev, newCompany]);
    return newCompany;
  };

  const updateCompany = (id: string, fields: Partial<Company>) => {
    const existing = allCompanies.find((c) => c.id === id);
    setAllCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
    // If company name was updated, cascade to trips and settlements where companyId was recorded as old name
    if (existing && fields.name && fields.name !== existing.name) {
      setAllTrips((prev) =>
        prev.map((trip) =>
          trip.companyId === existing.name ? { ...trip, companyId: fields.name! } : trip
        )
      );
      setAllSettlements((prev) =>
        prev.map((s) =>
          s.companyId === existing.name ? { ...s, companyId: fields.name! } : s
        )
      );
    }
  };

  const deleteCompany = (id: string) => {
    const comp = allCompanies.find((c) => c.id === id);
    const cName = comp?.name;
    const hasTrips = allTrips.some((t) => t.companyId === id || (cName && t.companyId === cName));
    const hasSettlements = allSettlements.some((s) => s.companyId === id || (cName && s.companyId === cName));
    if (hasTrips || hasSettlements) {
      if (!window.confirm(`Company "${cName || id}" has associated trips and receivables. Deleting it will also remove those records. Continue?`)) {
        return;
      }
      setAllTrips((prev) => prev.filter((t) => t.companyId !== id && (!cName || t.companyId !== cName)));
      setAllSettlements((prev) => prev.filter((s) => s.companyId !== id && (!cName || s.companyId !== cName)));
    }
    setAllCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const addDriver = (
    input: { name: string; phone: string; licenseNumber: string; joiningDate?: string; status?: DriverStatus } | string,
    phone?: string,
    licenseNumber?: string,
    joiningDate?: string
  ): Driver => {
    const driverData = typeof input === 'string'
      ? { name: input, phone: phone || '', licenseNumber: licenseNumber || '', joiningDate, status: 'ACTIVE' as DriverStatus }
      : input;

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      profileId: activeProfileId,
      name: driverData.name.trim(),
      phone: driverData.phone.trim(),
      licenseNumber: driverData.licenseNumber.trim(),
      joiningDate: driverData.joiningDate,
      status: driverData.status || 'ACTIVE',
    };
    setAllDrivers((prev) => [...prev, newDriver]);
    return newDriver;
  };

  const updateDriver = (id: string, fields: Partial<Driver>) => {
    const existing = allDrivers.find((d) => d.id === id);
    setAllDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...fields } : d)));
    // If driver name changed, cascade to trips and payments where driverId was stored as old name
    if (existing && fields.name && fields.name !== existing.name) {
      setAllTrips((prev) =>
        prev.map((trip) =>
          trip.driverId === existing.name ? { ...trip, driverId: fields.name! } : trip
        )
      );
      setAllDriverPayments((prev) =>
        prev.map((p) =>
          p.driverId === existing.name ? { ...p, driverId: fields.name! } : p
        )
      );
    }
  };

  const deleteDriver = (id: string) => {
    const drv = allDrivers.find((d) => d.id === id);
    const dName = drv?.name;
    const hasTrips = allTrips.some((t) => t.driverId === id || (dName && t.driverId === dName));
    const hasPayments = allDriverPayments.some((p) => p.driverId === id || (dName && p.driverId === dName));
    if (hasTrips || hasPayments) {
      if (!window.confirm(`Driver "${dName || id}" has associated trips or salary payout logs. Deleting the driver will remove those records. Continue?`)) {
        return;
      }
      setAllTrips((prev) => prev.filter((t) => t.driverId !== id && (!dName || t.driverId !== dName)));
      setAllDriverPayments((prev) => prev.filter((p) => p.driverId !== id && (!dName || p.driverId !== dName)));
    }
    setAllDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <FleetContext.Provider
      value={{
        profiles,
        activeProfileId,
        activeProfile,
        setActiveProfileId,
        addProfile,
        updateProfile,
        deleteProfile,

        activeRules,
        updateRules,

        trucks,
        companies,
        drivers,
        trips,
        truckExpenses,
        driverPayments,
        companySettlements,
        dateFilter,
        currency,
        setDateFilter,

        addTrip,
        updateTrip,
        deleteTrip,

        addTruckExpense,
        updateTruckExpense,
        deleteTruckExpense,

        addDriverPayment,
        updateDriverPayment,
        deleteDriverPayment,

        addCompanySettlement,
        updateCompanySettlement,
        deleteCompanySettlement,

        addTruck,
        updateTruck,
        deleteTruck,

        addCompany,
        updateCompany,
        deleteCompany,

        addDriver,
        updateDriver,
        deleteDriver,

        getTruckReg,
        getCompanyName,
        getDriverName,
        getTripExpenses,
        getTripReimbursable,
        getTripBalancePending,
        getTripProfit,

        filteredTrips,
        filteredTruckExpenses,
        filteredDriverPayments,
        filteredCompanySettlements,
        summaryMetrics,
        companyAccounts,
        driverAccounts,
        truckPerformanceList,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
