
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupabaseAuthWrapper from "@/components/SupabaseAuthWrapper";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import AddDriver from "./pages/AddDriver";
import EditDriver from "./pages/EditDriver";
import Vehicles from "./pages/Vehicles";
import AddVehicle from "./pages/AddVehicle";
import EditVehicle from "./pages/EditVehicle";
import DriverEarnings from "./pages/DriverEarnings";
import CompanyEarnings from "./pages/CompanyEarnings";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <SupabaseAuthWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/add-driver" element={<AddDriver />} />
              <Route path="/edit-driver/:id" element={<EditDriver />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/add-vehicle" element={<AddVehicle />} />
              <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
              <Route path="/driver-earnings/:id" element={<DriverEarnings />} />
              <Route path="/company-earnings" element={<CompanyEarnings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SupabaseAuthWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
