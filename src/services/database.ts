import { supabase } from "@/integrations/supabase/client";

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  number: string;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyEarning {
  id: string;
  driver_id: string;
  week_start_date: string;
  week_end_date: string;
  weekly_earning: number;
  cash: number;
  tax: number;
  toll: number;
  rent: number;
  adjustment: number;
  other: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyEarning {
  id: string;
  week_start_date: string;
  week_end_date: string;
  total_company_earning: number;
  total_driver_payouts: number;
  owner_earning: number;
  created_at: string;
}

// Driver operations
export const getDrivers = async (): Promise<Driver[]> => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addDriver = async (driver: { name: string; mobile: string }): Promise<Driver> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('drivers')
    .insert([{ ...driver, owner_id: user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateDriver = async (id: string, updates: Partial<Driver>): Promise<Driver> => {
  const { data, error } = await supabase
    .from('drivers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteDriver = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Vehicle operations
export const getVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addVehicle = async (vehicle: { number: string; status?: string }): Promise<Vehicle> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vehicles')
    .insert([{ ...vehicle, owner_id: user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Weekly Earnings operations
export const getWeeklyEarnings = async (): Promise<WeeklyEarning[]> => {
  const { data, error } = await supabase
    .from('weekly_earnings')
    .select('*')
    .order('week_start_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getDriverWeeklyEarning = async (driverId: string, weekStart: string): Promise<WeeklyEarning | null> => {
  const { data, error } = await supabase
    .from('weekly_earnings')
    .select('*')
    .eq('driver_id', driverId)
    .eq('week_start_date', weekStart)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const addWeeklyEarning = async (earning: Omit<WeeklyEarning, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyEarning> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('weekly_earnings')
    .insert([{ ...earning, owner_id: user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateWeeklyEarning = async (id: string, updates: Partial<WeeklyEarning>): Promise<WeeklyEarning> => {
  const { data, error } = await supabase
    .from('weekly_earnings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Company Earnings operations
export const getCompanyEarnings = async (): Promise<CompanyEarning[]> => {
  const { data, error } = await supabase
    .from('company_earnings')
    .select('*')
    .order('week_start_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addCompanyEarning = async (earning: Omit<CompanyEarning, 'id' | 'created_at'>): Promise<CompanyEarning> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('company_earnings')
    .insert([{ ...earning, owner_id: user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Utility functions
export const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
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

export const formatWeekRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

export const getDriverPerformanceData = async (driverId: string, weeks: number = 8) => {
  const { data, error } = await supabase
    .from('weekly_earnings')
    .select('*')
    .eq('driver_id', driverId)
    .order('week_start_date', { ascending: false })
    .limit(weeks);
  
  if (error) throw error;
  
  return (data || []).map(e => ({
    week: formatWeekRange(e.week_start_date, e.week_end_date),
    amount: e.total_amount,
    weekStart: e.week_start_date
  }));
};

export const getCompanyPerformanceData = async (weeks: number = 8) => {
  const { data, error } = await supabase
    .from('company_earnings')
    .select('*')
    .order('week_start_date', { ascending: false })
    .limit(weeks);
  
  if (error) throw error;
  
  return (data || []).map(e => ({
    week: formatWeekRange(e.week_start_date, e.week_end_date),
    company: e.total_company_earning,
    drivers: e.total_driver_payouts,
    owner: e.owner_earning,
    weekStart: e.week_start_date
  }));
};
