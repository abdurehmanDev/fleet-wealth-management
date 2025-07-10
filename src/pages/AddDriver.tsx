import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { addDriver, getDrivers } from "@/services/database";

const AddDriver = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ''));
  };

  const formatMobile = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+91')) {
      const number = cleaned.slice(3);
      if (number.length <= 5) return `+91 ${number}`;
      return `+91 ${number.slice(0, 5)} ${number.slice(5, 10)}`;
    } else if (cleaned.startsWith('91') && cleaned.length > 2) {
      const number = cleaned.slice(2);
      if (number.length <= 5) return `+91 ${number}`;
      return `+91 ${number.slice(0, 5)} ${number.slice(5, 10)}`;
    } else if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      if (cleaned.length <= 5) return `+91 ${cleaned}`;
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
    }
    
    return cleaned;
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobile(e.target.value);
    setFormData(prev => ({ ...prev, mobile: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Driver name is required",
        variant: "destructive"
      });
      return;
    }

    if (!validateMobile(formData.mobile)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for duplicate mobile number
      const existingDrivers = await getDrivers();
      const duplicateMobile = existingDrivers.find(d => d.mobile === formData.mobile);
      if (duplicateMobile) {
        toast({
          title: "Validation Error",
          description: "A driver with this mobile number already exists",
          variant: "destructive"
        });
        return;
      }

      const newDriver = await addDriver({
        name: formData.name.trim(),
        mobile: formData.mobile
      });
      
      toast({
        title: "Success!",
        description: `Driver ${newDriver.name} has been added successfully`,
        variant: "default"
      });
      
      // Reset form
      setFormData({ name: "", mobile: "" });
      
      // Navigate back to home after a brief delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add driver. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-all duration-200">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Add New Driver</h1>
              <p className="text-blue-100 mt-1">Enter driver information to get started</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto shadow-xl bg-white/90 backdrop-blur-sm border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                  Driver Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter driver's full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="mobile" className="text-base font-semibold text-gray-700">
                  Mobile Number *
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-100 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    className="h-14 pl-16 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-sm text-gray-500 ml-1">
                  Format: +91 XXXXX XXXXX
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Driver...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Add Driver</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDriver;
