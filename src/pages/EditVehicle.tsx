
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string;
  number: string;
  status: string;
}

const EditVehicle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    status: "Active"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (id) {
      loadVehicle();
    }
  }, [id]);

  const loadVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setVehicle(data);
      setFormData({
        number: data.number,
        status: data.status || "Active"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load vehicle details",
        variant: "destructive"
      });
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.number.trim()) {
      newErrors.number = "Vehicle number is required";
    } else if (formData.number.trim().length < 3) {
      newErrors.number = "Vehicle number must be at least 3 characters";
    }
    
    if (!formData.status) {
      newErrors.status = "Status is required";
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
        .from('vehicles')
        .update({
          number: formData.number.trim().toUpperCase(),
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Vehicle Updated Successfully!",
        description: `Vehicle ${formData.number.toUpperCase()} has been updated`,
        variant: "default"
      });

      setTimeout(() => {
        navigate("/vehicles");
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/vehicles">
              <Button variant="ghost" size="sm" className="text-white hover:bg-green-500">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Edit Vehicle</h1>
              <p className="text-green-100">Update vehicle information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b-2 border-gray-100">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <span className="font-bold text-gray-800">Vehicle Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="number" className="text-sm font-medium flex items-center gap-2">
                  Vehicle Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="number"
                  type="text"
                  placeholder="Enter vehicle registration number"
                  value={formData.number}
                  onChange={(e) => handleInputChange("number", e.target.value)}
                  className={`h-12 text-lg ${errors.number ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'} transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.number && <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.number}
                </p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                  Vehicle Status <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`h-12 ${errors.status ? 'border-red-500' : 'focus:border-green-500'} transition-colors`}>
                    <SelectValue placeholder="Select vehicle status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="Maintenance">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Maintenance
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactive">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.status}
                </p>}
              </div>

              <div className="pt-6 space-y-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Vehicle...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      Update Vehicle
                    </div>
                  )}
                </Button>

                <Link to="/vehicles">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-10 border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {formData.number && !errors.number && (
          <Card className="mt-6 border-l-4 border-green-500 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Preview</p>
                  <p className="text-sm text-green-700">
                    Vehicle: <span className="font-mono font-semibold">{formData.number.toUpperCase()}</span> - 
                    Status: <span className="font-semibold">{formData.status}</span>
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

export default EditVehicle;
