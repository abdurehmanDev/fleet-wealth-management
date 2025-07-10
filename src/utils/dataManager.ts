
// Simple in-memory data management (replace with real database integration)
export interface Driver {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  number: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyEarning {
  id: string;
  driverId: string;
  weekStartDate: string;
  weekEndDate: string;
  weeklyEarning: number;
  cash: number;
  tax: number;
  toll: number;
  rent: number;
  adjustment: number;
  other: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyEarning {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  totalCompanyEarning: number;
  totalDriverPayouts: number;
  ownerEarning: number;
  createdAt: string;
}

// Get current week dates
export const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
};

// Format week for display
export const formatWeekRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

// Data storage keys
const DRIVERS_KEY = 'rangrej_drivers';
const VEHICLES_KEY = 'rangrej_vehicles';
const WEEKLY_EARNINGS_KEY = 'rangrej_weekly_earnings';
const COMPANY_EARNINGS_KEY = 'rangrej_company_earnings';

// Driver CRUD operations
export const getDrivers = (): Driver[] => {
  const data = localStorage.getItem(DRIVERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addDriver = (driver: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Driver => {
  const drivers = getDrivers();
  const newDriver: Driver = {
    ...driver,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  drivers.push(newDriver);
  localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  return newDriver;
};

export const updateDriver = (id: string, updates: Partial<Driver>): Driver | null => {
  const drivers = getDrivers();
  const index = drivers.findIndex(d => d.id === id);
  if (index === -1) return null;
  
  drivers[index] = { ...drivers[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  return drivers[index];
};

export const deleteDriver = (id: string): boolean => {
  const drivers = getDrivers();
  const filtered = drivers.filter(d => d.id !== id);
  if (filtered.length === drivers.length) return false;
  localStorage.setItem(DRIVERS_KEY, JSON.stringify(filtered));
  return true;
};

// Vehicle CRUD operations
export const getVehicles = (): Vehicle[] => {
  const data = localStorage.getItem(VEHICLES_KEY);
  return data ? JSON.parse(data) : [];
};

export const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle => {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  vehicles.push(newVehicle);
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  return newVehicle;
};

export const updateVehicle = (id: string, updates: Partial<Vehicle>): Vehicle | null => {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  return vehicles[index];
};

export const deleteVehicle = (id: string): boolean => {
  const vehicles = getVehicles();
  const filtered = vehicles.filter(v => v.id !== id);
  if (filtered.length === vehicles.length) return false;
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(filtered));
  return true;
};

// Weekly Earnings CRUD operations
export const getWeeklyEarnings = (): WeeklyEarning[] => {
  const data = localStorage.getItem(WEEKLY_EARNINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDriverWeeklyEarning = (driverId: string, weekStart: string): WeeklyEarning | null => {
  const earnings = getWeeklyEarnings();
  return earnings.find(e => e.driverId === driverId && e.weekStartDate === weekStart) || null;
};

export const addWeeklyEarning = (earning: Omit<WeeklyEarning, 'id' | 'createdAt' | 'updatedAt'>): WeeklyEarning => {
  const earnings = getWeeklyEarnings();
  const newEarning: WeeklyEarning = {
    ...earning,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  earnings.push(newEarning);
  localStorage.setItem(WEEKLY_EARNINGS_KEY, JSON.stringify(earnings));
  return newEarning;
};

export const updateWeeklyEarning = (id: string, updates: Partial<WeeklyEarning>): WeeklyEarning | null => {
  const earnings = getWeeklyEarnings();
  const index = earnings.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  earnings[index] = { ...earnings[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(WEEKLY_EARNINGS_KEY, JSON.stringify(earnings));
  return earnings[index];
};

// Company Earnings operations
export const getCompanyEarnings = (): CompanyEarning[] => {
  const data = localStorage.getItem(COMPANY_EARNINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addCompanyEarning = (earning: Omit<CompanyEarning, 'id' | 'createdAt'>): CompanyEarning => {
  const earnings = getCompanyEarnings();
  const newEarning: CompanyEarning = {
    ...earning,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  earnings.push(newEarning);
  localStorage.setItem(COMPANY_EARNINGS_KEY, JSON.stringify(earnings));
  return newEarning;
};

// Analytics functions
export const getDriverPerformanceData = (driverId: string, weeks: number = 8) => {
  const earnings = getWeeklyEarnings().filter(e => e.driverId === driverId);
  return earnings
    .sort((a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime())
    .slice(-weeks)
    .map(e => ({
      week: formatWeekRange(e.weekStartDate, e.weekEndDate),
      amount: e.totalAmount,
      weekStart: e.weekStartDate
    }));
};

export const getCompanyPerformanceData = (weeks: number = 8) => {
  const earnings = getCompanyEarnings();
  return earnings
    .sort((a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime())
    .slice(-weeks)
    .map(e => ({
      week: formatWeekRange(e.weekStartDate, e.weekEndDate),
      company: e.totalCompanyEarning,
      drivers: e.totalDriverPayouts,
      owner: e.ownerEarning,
      weekStart: e.weekStartDate
    }));
};
