
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, Phone, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getDrivers, deleteDriver, type Driver } from "@/services/database";
import { supabase } from "@/integrations/supabase/client";

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDrivers = async () => {
    try {
      const driversData = await getDrivers();
      setDrivers(driversData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load drivers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();

    // Set up real-time subscription for drivers
    const channel = supabase
      .channel('drivers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers'
        },
        (payload) => {
          console.log('Driver change detected:', payload);
          loadDrivers(); // Reload drivers when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteDriver = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete driver "${name}"?`)) {
      try {
        await deleteDriver(id);
        toast({
          title: "Driver Deleted",
          description: `${name} has been removed successfully`,
          variant: "default"
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete driver",
          variant: "destructive"
        });
      }
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.mobile.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-500">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">All Drivers</h1>
              <p className="text-blue-100">Manage your driver fleet</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search drivers by name or mobile number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
              <p className="text-sm text-gray-600">Total Drivers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{filteredDrivers.length}</p>
              <p className="text-sm text-gray-600">Filtered Results</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">₹</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Active</p>
              <p className="text-sm text-gray-600">Fleet Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Drivers List */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle>Driver Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDrivers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No drivers found matching your search.</p>
                <Link to="/add-driver" className="mt-4 inline-block">
                  <Button>Add First Driver</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDrivers.map((driver) => (
                  <div key={driver.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link to={`/driver-earnings/${driver.id}`}>
                          <h3 className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer text-lg">
                            {driver.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {driver.mobile}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Added: {new Date(driver.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex gap-2">
                        <Link to={`/driver-earnings/${driver.id}`}>
                          <Button size="sm" variant="outline" className="mt-2">
                            Calculate
                          </Button>
                        </Link>
                        <Link to={`/edit-driver/${driver.id}`}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-50 border-blue-200 mt-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteDriver(driver.id, driver.name)}
                          className="text-red-600 hover:bg-red-50 border-red-200 mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Driver Button */}
        <div className="mt-6">
          <Link to="/add-driver">
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-12">
              <Users className="mr-2 h-5 w-5" />
              Add New Driver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
