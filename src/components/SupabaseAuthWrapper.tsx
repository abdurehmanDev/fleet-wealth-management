
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from '@supabase/supabase-js';
import AuthPage from "@/pages/AuthPage";

interface SupabaseAuthWrapperProps {
  children: React.ReactNode;
}

const SupabaseAuthWrapper: React.FC<SupabaseAuthWrapperProps> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide Lovable watermark
    const hideLovableBadge = () => {
      const lovableBadge = document.querySelector('[data-lovable-badge], .lovable-badge, [class*="lovable"], [id*="lovable"]');
      if (lovableBadge) {
        (lovableBadge as HTMLElement).style.display = 'none';
      }
    };

    // Hide immediately and also check periodically
    hideLovableBadge();
    const interval = setInterval(hideLovableBadge, 1000);

    // Also hide any badges that might be added dynamically
    const observer = new MutationObserver(() => {
      hideLovableBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Check for existing session and set up auth listener
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      clearInterval(interval);
      observer.disconnect();
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <div className="fixed top-2 right-4 z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-100 p-2 flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-3 shadow-sm">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">Admin</span>
            <span className="text-xs text-gray-500">Fleet Manager</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl p-3 transition-all duration-200"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div>
        {children}
      </div>
    </>
  );
};

export default SupabaseAuthWrapper;
