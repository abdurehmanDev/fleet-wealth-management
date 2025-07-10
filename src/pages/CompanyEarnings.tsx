
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Building2, CheckCircle, Edit, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";

// Helper functions for week calculations
const getCurrentWeek = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  };
};

const formatWeekRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

// Database operations
const getWeeklyDriverEarnings = async (weekStartDate: string) => {
  try {
    const { data, error } = await supabase
      .from('weekly_earnings')
      .select('*')
      .eq('week_start_date', weekStartDate);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching weekly driver earnings:', error);
    return [];
  }
};

const getCompanyEarning = async (weekStartDate: string) => {
  try {
    const { data, error } = await supabase
      .from('company_earnings')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching company earning:', error);
    return null;
  }
};

const addCompanyEarning = async (earningData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('company_earnings')
      .insert([{
        ...earningData,
        owner_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding company earning:', error);
    throw error;
  }
};

const CompanyEarnings = () => {
  const { toast } = useToast();
  
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [existingEarning, setExistingEarning] = useState<any>(null);
  const [totalDriverPayouts, setTotalDriverPayouts] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [companyData, setCompanyData] = useState({
    totalCompanyEarning: "",
  });

  const [calculatedResults, setCalculatedResults] = useState({
    totalDriverPayouts: 0,
    ownerEarning: 0,
    totalCompanyEarning: 0
  });

  // Load data when week changes
  useEffect(() => {
    const loadWeekData = async () => {
      if (!selectedWeek.start) return;
      
      setLoading(true);
      try {
        // Get existing company earnings
        const companyEarning = await getCompanyEarning(selectedWeek.start);
        
        if (companyEarning) {
          setExistingEarning(companyEarning);
          setCompanyData({
            totalCompanyEarning: companyEarning.total_company_earning?.toString() || "",
          });
          setCalculatedResults({
            totalDriverPayouts: companyEarning.total_driver_payouts || 0,
            ownerEarning: companyEarning.owner_earning || 0,
            totalCompanyEarning: companyEarning.total_company_earning || 0
          });
        } else {
          setExistingEarning(null);
          setCompanyData({
            totalCompanyEarning: "",
          });
          setCalculatedResults({
            totalDriverPayouts: 0,
            ownerEarning: 0,
            totalCompanyEarning: 0
          });
        }

        // Calculate total driver payouts for the selected week
        const weeklyEarnings = await getWeeklyDriverEarnings(selectedWeek.start);
        const weekDriverPayouts = weeklyEarnings.reduce((sum, e) => sum + (e.total_amount || 0), 0);
        
        setTotalDriverPayouts(weekDriverPayouts);
      } catch (error) {
        console.error('Error loading week data:', error);
        toast({
          title: "Error",
          description: "Failed to load week data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadWeekData();
  }, [selectedWeek, toast]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'totalCompanyEarning') {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setCompanyData(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  const calculateEarnings = () => {
    const totalCompany = parseFloat(companyData.totalCompanyEarning) || 0;
    
    if (totalCompany <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid total company earning",
        variant: "destructive"
      });
      return;
    }

    if (totalCompany < totalDriverPayouts) {
      toast({
        title: "Invalid Input",
        description: "Company earning cannot be less than driver payouts",
        variant: "destructive"
      });
      return;
    }

    const ownerEarning = totalCompany - totalDriverPayouts;
    
    setCalculatedResults({
      totalDriverPayouts,
      ownerEarning,
      totalCompanyEarning: totalCompany
    });
  };

  const saveCompanyEarnings = async () => {
    if (!calculatedResults.ownerEarning && calculatedResults.ownerEarning !== 0) {
      toast({
        title: "No Calculation",
        description: "Please calculate earnings first",
        variant: "destructive"
      });
      return;
    }

    if (existingEarning) {
      toast({
        title: "Already Exists",
        description: "Earnings for this week have already been saved",
        variant: "default"
      });
      return;
    }

    setIsCalculating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newEarning = await addCompanyEarning({
        week_start_date: selectedWeek.start,
        week_end_date: selectedWeek.end,
        total_company_earning: calculatedResults.totalCompanyEarning,
        total_driver_payouts: calculatedResults.totalDriverPayouts,
        owner_earning: calculatedResults.ownerEarning
      });

      setExistingEarning(newEarning);
      
      toast({
        title: "Earnings Saved!",
        description: "Company earnings have been calculated and saved successfully",
        variant: "default"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company earnings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading week data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-indigo-500">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Calculate My Earnings</h1>
              <p className="text-indigo-100">Weekly owner earnings calculator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Week Selection */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50">
            <CardTitle>Select Week for Calculation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <WeeklyCalendar
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Status Alert */}
        {existingEarning && (
          <Card className="mb-6 border-l-4 border-green-500 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Owner earnings already calculated for this week
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-blue-500">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">₹{totalDriverPayouts.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Driver Payouts</p>
              <p className="text-xs text-blue-600 mt-1">This Week</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-green-500">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">₹{calculatedResults.ownerEarning.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Calculated Owner Share</p>
              <p className="text-xs text-green-600 mt-1">Company - Driver Payouts</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-purple-500">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">₹{calculatedResults.totalCompanyEarning.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Company Revenue</p>
              <p className="text-xs text-purple-600 mt-1">Input Required</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                Company Earnings Input
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="totalCompanyEarning" className="text-sm font-medium">
                  Total Company Earning <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalCompanyEarning"
                  type="text"
                  placeholder="50000"
                  value={companyData.totalCompanyEarning}
                  onChange={(e) => handleInputChange("totalCompanyEarning", e.target.value)}
                  className="h-12 text-lg"
                  disabled={!!existingEarning}
                />
                <p className="text-xs text-gray-500">Enter total company revenue for the week</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Calculation Formula
                </Label>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-mono text-gray-700">
                    Owner Earning = Company Earning - Driver Payouts
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Driver payouts are automatically calculated from this week's earnings
                  </p>
                </div>
              </div>

              <Button 
                onClick={calculateEarnings}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                disabled={!companyData.totalCompanyEarning || !!existingEarning}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Calculate My Earnings
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Calculation Breakdown */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle>Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Total Company Revenue</span>
                    <span className="font-bold text-lg">₹{calculatedResults.totalCompanyEarning.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Driver Payouts</span>
                    <span className="font-bold text-lg text-blue-600">-₹{calculatedResults.totalDriverPayouts.toLocaleString()}</span>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Owner Share</span>
                    <span className="font-bold text-xl text-green-600">₹{calculatedResults.ownerEarning.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {!existingEarning ? (
                <Button 
                  onClick={saveCompanyEarnings}
                  disabled={isCalculating || !calculatedResults.totalCompanyEarning}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  {isCalculating ? "Saving..." : "Save My Earnings"}
                </Button>
              ) : (
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium text-green-800">Earnings Saved Successfully!</p>
                  <p className="text-sm text-green-600 mt-1">
                    Week: {formatWeekRange(selectedWeek.start, selectedWeek.end)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyEarnings;
