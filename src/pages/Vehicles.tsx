
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Car, Plus, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getVehicles, deleteVehicle, type Vehicle } from "@/services/database";
import { supabase } from "@/integrations/supabase/client";

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadVehicles = async () => {
    try {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();

    // Set up real-time subscription for vehicles
    const channel = supabase
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('Vehicle change detected:', payload);
          loadVehicles(); // Reload vehicles when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteVehicle = async (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete vehicle "${number}"?`)) {
      try {
        await deleteVehicle(id);
        toast({
          title: "Vehicle Deleted",
          description: `${number} has been removed successfully`,
          variant: "default"
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete vehicle",
          variant: "destructive"
        });
      }
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Maintenance: "bg-yellow-100 text-yellow-800",
    Inactive: "bg-red-100 text-red-800"
  };

  const activeVehicles = vehicles.filter(v => v.status === "Active").length;
  const maintenanceVehicles = vehicles.filter(v => v.status === "Maintenance").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-green-500">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">All Vehicles</h1>
              <p className="text-green-100">Manage your vehicle fleet</p>
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
                placeholder="Search vehicles by number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              <p className="text-sm text-gray-600">Total Vehicles</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activeVehicles}</p>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{maintenanceVehicles}</p>
              <p className="text-sm text-gray-600">Maintenance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-sm">₹</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Fleet</p>
              <p className="text-sm text-gray-600">Management</p>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles List */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50">
            <CardTitle>Vehicle Fleet</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredVehicles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No vehicles found matching your search.</p>
                <Link to="/add-vehicle" className="mt-4 inline-block">
                  <Button>Add First Vehicle</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg font-mono">
                          {vehicle.number}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Added: {new Date(vehicle.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex gap-2 items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vehicle.status as keyof typeof statusColors] || statusColors.Active}`}>
                          {vehicle.status || 'Active'}
                        </span>
                        <Link to={`/edit-vehicle/${vehicle.id}`}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 hover:bg-green-50 border-green-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteVehicle(vehicle.id, vehicle.number)}
                          className="text-red-600 hover:bg-red-50 border-red-200"
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

        {/* Add Vehicle Button */}
        <div className="mt-6">
          <Link to="/add-vehicle">
            <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 h-12">
              <Plus className="mr-2 h-5 w-5" />
              Add New Vehicle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
