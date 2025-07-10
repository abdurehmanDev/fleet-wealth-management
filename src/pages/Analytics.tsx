
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart, TrendingUp, Users, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Driver {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  number: string;
}

interface EarningData {
  week: string;
  amount: number;
  weekStart: string;
}

const Analytics = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [driverEarnings, setDriverEarnings] = useState<EarningData[]>([]);
  const [companyEarnings, setCompanyEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      loadDriverEarnings(selectedDriver);
    }
  }, [selectedDriver]);

  const loadInitialData = async () => {
    try {
      // Load drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('id, name')
        .order('name');

      if (driversError) throw driversError;
      setDrivers(driversData || []);

      // Load vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, number')
        .order('number');

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Load company earnings
      const { data: companyData, error: companyError } = await supabase
        .from('company_earnings')
        .select('*')
        .order('week_start_date', { ascending: false })
        .limit(8);

      if (companyError) throw companyError;
      
      const formattedCompanyData = (companyData || []).map(e => ({
        week: `${new Date(e.week_start_date).toLocaleDateString()} - ${new Date(e.week_end_date).toLocaleDateString()}`,
        company: e.total_company_earning || 0,
        drivers: e.total_driver_payouts || 0,
        owner: e.owner_earning || 0,
        weekStart: e.week_start_date
      }));

      setCompanyEarnings(formattedCompanyData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDriverEarnings = async (driverId: string) => {
    try {
      const { data, error } = await supabase
        .from('weekly_earnings')
        .select('*')
        .eq('driver_id', driverId)
        .order('week_start_date', { ascending: false })
        .limit(8);

      if (error) throw error;

      const formattedData = (data || []).map(e => ({
        week: `${new Date(e.week_start_date).toLocaleDateString()} - ${new Date(e.week_end_date).toLocaleDateString()}`,
        amount: e.total_amount || 0,
        weekStart: e.week_start_date
      }));

      setDriverEarnings(formattedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load driver earnings",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-purple-500">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Analytics & Reports</h1>
              <p className="text-purple-100">Performance insights and earnings analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-600" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Driver</label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Vehicle</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vehicle to analyze" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Performance Overview */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Company Performance (Last 8 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={companyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                  <Bar dataKey="company" fill="#8884d8" name="Company Revenue" />
                  <Bar dataKey="drivers" fill="#82ca9d" name="Driver Payouts" />
                  <Bar dataKey="owner" fill="#ffc658" name="Owner Earnings" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Driver Performance */}
        {selectedDriver && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Driver Performance: {drivers.find(d => d.id === selectedDriver)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={driverEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']} />
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-l-4 border-purple-500">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{drivers.length}</p>
              <p className="text-sm text-gray-600">Total Drivers</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-green-500">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{vehicles.length}</p>
              <p className="text-sm text-gray-600">Total Vehicles</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-blue-500">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                ₹{companyEarnings.reduce((sum, e) => sum + e.company, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-yellow-500">
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                ₹{companyEarnings.reduce((sum, e) => sum + e.owner, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Owner Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Distribution */}
        {companyEarnings.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-indigo-600" />
                Earnings Distribution (Latest Week)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Owner Earnings', value: companyEarnings[0]?.owner || 0 },
                        { name: 'Driver Payouts', value: companyEarnings[0]?.drivers || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Owner Earnings', value: companyEarnings[0]?.owner || 0 },
                        { name: 'Driver Payouts', value: companyEarnings[0]?.drivers || 0 }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
