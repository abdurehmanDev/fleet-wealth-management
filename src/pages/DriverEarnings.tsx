
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Download, Share, Edit, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateBillPNG } from "@/components/BillGenerator";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";

// Define the driver interface to match what we expect
interface Driver {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
  updatedAt: string;
}

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
const getDriver = async (driverId: string): Promise<Driver | null> => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single();

    if (error) {
      console.error('Error fetching driver:', error);
      return null;
    }

    // Map database fields to expected interface
    return {
      id: data.id,
      name: data.name,
      mobile: data.mobile,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching driver:', error);
    return null;
  }
};

const getDriverWeeklyEarning = async (driverId: string, weekStartDate: string) => {
  try {
    const { data, error } = await supabase
      .from('weekly_earnings')
      .select('*')
      .eq('driver_id', driverId)
      .eq('week_start_date', weekStartDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching weekly earning:', error);
    return null;
  }
};

const addWeeklyEarning = async (earningData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('weekly_earnings')
      .insert([{
        ...earningData,
        owner_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding weekly earning:', error);
    throw error;
  }
};

const updateWeeklyEarning = async (id: string, earningData: any) => {
  try {
    const { data, error } = await supabase
      .from('weekly_earnings')
      .update(earningData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating weekly earning:', error);
    throw error;
  }
};

const DriverEarnings = () => {
  const { id: driverId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [existingEarning, setExistingEarning] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [earnings, setEarnings] = useState({
    weeklyEarning: "",
    cash: "",
    tax: "",
    toll: "",
    rent: "",
    adjustment: "",
    other: ""
  });

  const [totalAmount, setTotalAmount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const loadDriver = async () => {
      if (!driverId) {
        navigate('/drivers');
        return;
      }

      try {
        setLoading(true);
        const foundDriver = await getDriver(driverId);
        
        if (!foundDriver) {
          toast({
            title: "Driver Not Found",
            description: "The requested driver could not be found",
            variant: "destructive"
          });
          navigate('/drivers');
          return;
        }

        setDriver(foundDriver);
      } catch (error) {
        console.error('Error loading driver:', error);
        toast({
          title: "Error",
          description: "Failed to load driver information",
          variant: "destructive"
        });
        navigate('/drivers');
      } finally {
        setLoading(false);
      }
    };

    loadDriver();
  }, [driverId, navigate, toast]);

  // Check for existing earnings when week changes
  useEffect(() => {
    const loadExistingEarning = async () => {
      if (!driverId || !selectedWeek.start) return;
      
      const existing = await getDriverWeeklyEarning(driverId, selectedWeek.start);
      if (existing) {
        setExistingEarning(existing);
        setEarnings({
          weeklyEarning: existing.weekly_earning?.toString() || "",
          cash: existing.cash?.toString() || "",
          tax: existing.tax?.toString() || "",
          toll: existing.toll?.toString() || "",
          rent: existing.rent?.toString() || "",
          adjustment: existing.adjustment?.toString() || "",
          other: existing.other?.toString() || "",
        });
        setIsEditing(false);
      } else {
        setExistingEarning(null);
        setEarnings({
          weeklyEarning: "",
          cash: "",
          tax: "",
          toll: "",
          rent: "",
          adjustment: "",
          other: ""
        });
        setIsEditing(false);
      }
    };

    loadExistingEarning();
  }, [driverId, selectedWeek]);

  // Calculate total amount whenever earnings change
  useEffect(() => {
    const weeklyEarning = parseFloat(earnings.weeklyEarning) || 0;
    const cash = parseFloat(earnings.cash) || 0;
    const tax = parseFloat(earnings.tax) || 0;
    const toll = parseFloat(earnings.toll) || 0;
    const rent = parseFloat(earnings.rent) || 0;
    const adjustment = parseFloat(earnings.adjustment) || 0;
    const other = parseFloat(earnings.other) || 0;

    const total = weeklyEarning - cash - tax + toll - rent + adjustment - other;
    setTotalAmount(total);
  }, [earnings]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!earnings.weeklyEarning || parseFloat(earnings.weeklyEarning) <= 0) {
      newErrors.weeklyEarning = "Weekly earning is required and must be greater than 0";
    }
    if (!earnings.cash || parseFloat(earnings.cash) < 0) {
      newErrors.cash = "Cash amount is required and cannot be negative";
    }
    if (!earnings.tax || parseFloat(earnings.tax) < 0) {
      newErrors.tax = "Tax amount is required and cannot be negative";
    }
    if (!earnings.toll || parseFloat(earnings.toll) < 0) {
      newErrors.toll = "Toll amount is required and cannot be negative";
    }
    if (!earnings.rent || parseFloat(earnings.rent) < 0) {
      newErrors.rent = "Rent amount is required and cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    // Only allow positive numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setEarnings(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handleSaveEarnings = async () => {
    console.log('Calculate button clicked');
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    if (!driver) {
      toast({
        title: "Error",
        description: "Driver information not found",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const earningData = {
        driver_id: driver.id,
        week_start_date: selectedWeek.start,
        week_end_date: selectedWeek.end,
        weekly_earning: parseFloat(earnings.weeklyEarning),
        cash: parseFloat(earnings.cash) || 0,
        tax: parseFloat(earnings.tax) || 0,
        toll: parseFloat(earnings.toll) || 0,
        rent: parseFloat(earnings.rent) || 0,
        adjustment: parseFloat(earnings.adjustment) || 0,
        other: parseFloat(earnings.other) || 0,
        total_amount: totalAmount
      };

      if (existingEarning && !isEditing) {
        toast({
          title: "Already Calculated",
          description: "Earnings for this week have already been calculated. Use Edit to modify.",
          variant: "default"
        });
        return;
      }

      if (existingEarning && isEditing) {
        const updated = await updateWeeklyEarning(existingEarning.id, earningData);
        if (updated) {
          setExistingEarning(updated);
          setIsEditing(false);
          toast({
            title: "Earnings Updated!",
            description: "Weekly earnings have been updated successfully",
            variant: "default"
          });
        }
      } else {
        const newEarning = await addWeeklyEarning(earningData);
        setExistingEarning(newEarning);
        toast({
          title: "Earnings Calculated!",
          description: "Weekly earnings have been calculated and saved successfully",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error saving earnings:', error);
      toast({
        title: "Error",
        description: "Failed to save earnings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBill = async () => {
    if (!existingEarning || !driver) {
      toast({
        title: "No Data",
        description: "Please save the earnings first before generating bill",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await generateBillPNG({
        driver,
        weekStart: selectedWeek.start,
        weekEnd: selectedWeek.end,
        earnings,
        totalAmount
      });
      
      toast({
        title: "Bill Generated!",
        description: "Earnings statement has been downloaded as PNG",
        variant: "default"
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bill. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnWhatsApp = () => {
    if (!driver || !existingEarning) return;

    const message = `🚗 *Rangrej Fleet - Weekly Earnings Statement*

👤 *Driver:* ${driver.name}
📱 *Phone:* ${driver.mobile}
📅 *Week:* ${formatWeekRange(selectedWeek.start, selectedWeek.end)}

💰 *Earnings Breakdown:*
• Weekly Earning: ₹${earnings.weeklyEarning || 0}
• Cash Deduction: -₹${earnings.cash || 0}
• Tax Deduction: -₹${earnings.tax || 0}
• Toll Addition: +₹${earnings.toll || 0}
• Rent Deduction: -₹${earnings.rent || 0}
• Adjustment: +₹${earnings.adjustment || 0}
• Other Deduction: -₹${earnings.other || 0}

*Net Amount: ₹${totalAmount.toFixed(2)}*

Generated by Rangrej Fleet Management System`;

    const phone = driver.mobile.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading driver information...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return <div>Loading...</div>;
  }

  const canEdit = existingEarning && !isEditing;
  const isReadOnly = existingEarning && !isEditing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 w-full">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link to="/drivers">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full p-3 transition-all duration-200">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Weekly Earnings Calculator</h1>
              <p className="text-purple-100 text-lg">Calculate and manage driver earnings for the selected week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Selection with enhanced styling */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
            <CardTitle className="text-2xl text-gray-800 flex items-center gap-3">
              <Calculator className="h-6 w-6 text-indigo-600" />
              Select Week for Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <WeeklyCalendar
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
              className="max-w-md mx-auto"
            />
          </CardContent>
        </Card>

        {/* Status Alert with enhanced styling */}
        {existingEarning && (
          <Card className="mb-8 border-l-4 border-emerald-500 bg-emerald-50/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span className="font-semibold text-emerald-800 text-lg">
                    Weekly earnings already calculated for this period
                  </span>
                </div>
                {canEdit && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-100 rounded-full px-6"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Driver Info with enhanced styling */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
            <CardTitle className="text-2xl text-gray-800">Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Driver Name</p>
                <p className="text-2xl font-bold text-gray-900">{driver.name}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Mobile Number</p>
                <p className="text-2xl font-bold text-gray-900">{driver.mobile}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Earnings Form */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
                <Calculator className="h-6 w-6 text-indigo-600" />
                Earnings Calculation
                {isEditing && (
                  <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                    Editing Mode
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="weeklyEarning" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                  Weekly Earning <span className="text-emerald-600 text-lg">+</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weeklyEarning"
                  type="text"
                  placeholder="25000"
                  value={earnings.weeklyEarning}
                  onChange={(e) => handleInputChange("weeklyEarning", e.target.value)}
                  className={`h-14 text-lg border-2 rounded-xl transition-all duration-200 ${errors.weeklyEarning ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                  disabled={isReadOnly}
                />
                {errors.weeklyEarning && <p className="text-red-500 text-sm font-medium">{errors.weeklyEarning}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="cash" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    Cash <span className="text-red-600 text-lg">-</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cash"
                    type="text"
                    placeholder="2000"
                    value={earnings.cash}
                    onChange={(e) => handleInputChange("cash", e.target.value)}
                    className={`h-12 border-2 rounded-xl transition-all duration-200 ${errors.cash ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                    disabled={isReadOnly}
                  />
                  {errors.cash && <p className="text-red-500 text-sm font-medium">{errors.cash}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tax" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    Tax <span className="text-red-600 text-lg">-</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tax"
                    type="text"
                    placeholder="1500"
                    value={earnings.tax}
                    onChange={(e) => handleInputChange("tax", e.target.value)}
                    className={`h-12 border-2 rounded-xl transition-all duration-200 ${errors.tax ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                    disabled={isReadOnly}
                  />
                  {errors.tax && <p className="text-red-500 text-sm font-medium">{errors.tax}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="toll" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    Toll <span className="text-emerald-600 text-lg">+</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="toll"
                    type="text"
                    placeholder="500"
                    value={earnings.toll}
                    onChange={(e) => handleInputChange("toll", e.target.value)}
                    className={`h-12 border-2 rounded-xl transition-all duration-200 ${errors.toll ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                    disabled={isReadOnly}
                  />
                  {errors.toll && <p className="text-red-500 text-sm font-medium">{errors.toll}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="rent" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    Rent <span className="text-red-600 text-lg">-</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rent"
                    type="text"
                    placeholder="3000"
                    value={earnings.rent}
                    onChange={(e) => handleInputChange("rent", e.target.value)}
                    className={`h-12 border-2 rounded-xl transition-all duration-200 ${errors.rent ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                    disabled={isReadOnly}
                  />
                  {errors.rent && <p className="text-red-500 text-sm font-medium">{errors.rent}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="adjustment" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    Adjustment <span className="text-emerald-600 text-lg">+</span>
                    <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                  </Label>
                  <Input
                    id="adjustment"
                    type="text"
                    placeholder="0"
                    value={earnings.adjustment}
                    onChange={(e) => handleInputChange("adjustment", e.target.value)}
                    className="h-12 border-2 rounded-xl transition-all duration-200 border-gray-200 focus:border-indigo-500"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="other" className="text-base font-semibold flex items-center gap-2 text-gray-700">
                    Other <span className="text-red-600 text-lg">-</span>
                    <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                  </Label>
                  <Input
                    id="other"
                    type="text"
                    placeholder="0"
                    value={earnings.other}
                    onChange={(e) => handleInputChange("other", e.target.value)}
                    className="h-12 border-2 rounded-xl transition-all duration-200 border-gray-200 focus:border-indigo-500"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Summary & Actions */}
          <div className="space-y-6">
            {/* Enhanced Total Amount */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Net Amount</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-emerald-600 mb-2">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-lg">Final Earnings Amount</p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Breakdown */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-xl text-gray-800">Calculation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Weekly Earning</span>
                    <span className="text-emerald-600 font-bold">+₹{earnings.weeklyEarning || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Cash Deduction</span>
                    <span className="text-red-600 font-bold">-₹{earnings.cash || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Tax Deduction</span>
                    <span className="text-red-600 font-bold">-₹{earnings.tax || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Toll Addition</span>
                    <span className="text-emerald-600 font-bold">+₹{earnings.toll || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium">Rent Deduction</span>
                    <span className="text-red-600 font-bold">-₹{earnings.rent || 0}</span>
                  </div>
                  {earnings.adjustment && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Adjustment</span>
                      <span className="text-emerald-600 font-bold">+₹{earnings.adjustment || 0}</span>
                    </div>
                  )}
                  {earnings.other && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium">Other Deduction</span>
                      <span className="text-red-600 font-bold">-₹{earnings.other || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 rounded-lg mt-4">
                    <span className="font-bold text-lg">Net Amount</span>
                    <span className="text-emerald-600 font-bold text-xl">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Actions */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Button 
                    onClick={handleSaveEarnings}
                    disabled={isGenerating || !earnings.weeklyEarning}
                    className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving Changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  {!existingEarning && (
                    <Button 
                      onClick={handleSaveEarnings}
                      disabled={isGenerating || !earnings.weeklyEarning}
                      className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="mr-3 h-6 w-6" />
                          Calculate Earnings
                        </>
                      )}
                    </Button>
                  )}

                  <Button 
                    onClick={generateBill}
                    disabled={isGenerating || !existingEarning}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating Bill...
                      </>
                    ) : (
                      <>
                        <Download className="mr-3 h-5 w-5" />
                        Generate Bill (PNG)
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={shareOnWhatsApp}
                    disabled={!existingEarning}
                    variant="outline"
                    className="w-full h-14 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    <Share className="mr-3 h-5 w-5" />
                    Share on WhatsApp
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;
