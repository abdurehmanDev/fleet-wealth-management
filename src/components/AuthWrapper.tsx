
import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, LogIn } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold">Rangrej Fleet</CardTitle>
              <p className="text-blue-100 text-sm mt-2">Owner Access Required</p>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome Back, Owner
                </h2>
                <p className="text-gray-600">
                  Please sign in to access your fleet management dashboard
                </p>
              </div>
              
              <SignInButton mode="modal">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold shadow-lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In as Owner
                </Button>
              </SignInButton>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Secure access for fleet owners only
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-full shadow-lg p-1">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>
        {children}
      </SignedIn>
    </>
  );
};

export default AuthWrapper;
