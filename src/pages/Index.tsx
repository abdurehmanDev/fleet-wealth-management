
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  Calculator, 
  DollarSign, 
  Plus, 
  TrendingUp,
  BarChart,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Fleet Management
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              Streamline your taxi business with our comprehensive fleet management system
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Dashboard Quick Access */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard</h2>
          <div className="max-w-2xl mx-auto">
            <Link to="/dashboard">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardContent className="p-8 text-center">
                  <div className="bg-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-700 transition-colors">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Earnings Dashboard</h3>
                  <p className="text-gray-600 text-lg">View driver earnings, cash, and toll collections by week</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link to="/add-driver">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Add New Driver</h3>
                  <p className="text-gray-600">Register a new driver to your fleet</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/add-vehicle">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-8 text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-700 transition-colors">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Add New Vehicle</h3>
                  <p className="text-gray-600">Register a new vehicle to your fleet</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Manage Your Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/drivers">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">All Drivers</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">View and manage all registered drivers</p>
                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                    View Drivers
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/vehicles">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">All Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">View and manage your vehicle fleet</p>
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    View Vehicles
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/company-earnings">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Calculator className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">Calculate My Earnings</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">Calculate weekly owner earnings</p>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                    Calculate Now
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/analytics">
              <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BarChart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">Analytics & Reports</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">View performance insights and reports</p>
                  <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Driver Management</h3>
              <p className="text-gray-600">Efficiently manage your driver database with detailed profiles and performance tracking</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Fleet Tracking</h3>
              <p className="text-gray-600">Keep track of all your vehicles with real-time status updates and maintenance schedules</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Earnings Analytics</h3>
              <p className="text-gray-600">Calculate and track weekly earnings with detailed breakdowns and performance insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
