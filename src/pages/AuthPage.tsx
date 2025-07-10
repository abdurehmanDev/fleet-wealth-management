
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, User, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-lg">
          <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Shield className="h-10 w-10 drop-shadow-sm" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">Rangrej Fleet</CardTitle>
          <p className="text-blue-100 text-lg">Admin Portal</p>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-md">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
            <p className="text-gray-600 text-lg">Enter your credentials to access the fleet management system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rangrejfleet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <LogIn className="h-6 w-6" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-medium">Secure Admin Access Only</p>
            </div>
            <p className="text-xs text-blue-600 text-center mt-2">
              Contact system administrator for access credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
