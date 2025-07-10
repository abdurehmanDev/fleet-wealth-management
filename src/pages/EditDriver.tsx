
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Driver {
  id: string;
  name: string;
  mobile: string;
}

const EditDriver = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (id) {
      loadDriver();
    }
  }, [id]);

  const loadDriver = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setDriver(data);
      setFormData({
        name: data.name,
        mobile: data.mobile
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load driver details",
        variant: "destructive"
      });
      navigate("/drivers");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Driver name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Driver name must be at least 2 characters";
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Driver Updated Successfully!",
        description: `${formData.name} has been updated`,
        variant: "default"
      });

      setTimeout(() => {
        navigate("/drivers");
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update driver. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/drivers">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-500">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Edit Driver</h1>
              <p className="text-blue-100">Update driver information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-gray-100">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-gray-800">Driver Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  Driver Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter driver's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`h-12 text-lg ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.name}
                </p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium flex items-center gap-2">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`h-12 text-lg ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.mobile && <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.mobile}
                </p>}
              </div>

              <div className="pt-6 space-y-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Driver...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      Update Driver
                    </div>
                  )}
                </Button>

                <Link to="/drivers">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-10 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {formData.name && !errors.name && (
          <Card className="mt-6 border-l-4 border-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Preview</p>
                  <p className="text-sm text-blue-700">
                    Driver: <span className="font-semibold">{formData.name}</span> - 
                    Mobile: <span className="font-semibold">{formData.mobile}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EditDriver;
