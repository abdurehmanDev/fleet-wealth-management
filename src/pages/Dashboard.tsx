
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { WeeklyEarningsTable } from "@/components/Dashboard/WeeklyEarningsTable";
import { getDrivers, getWeeklyEarnings, getCurrentWeek } from "@/services/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Dashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });

  const { data: allEarnings = [], isLoading: earningsLoading, refetch } = useQuery({
    queryKey: ['weekly-earnings'],
    queryFn: getWeeklyEarnings,
  });

  // Filter earnings for the selected week
  const weekEarnings = allEarnings.filter(earning => 
    earning.week_start_date === selectedWeek.start
  );

  const handleWeekChange = (week: { start: string; end: string }) => {
    setSelectedWeek(week);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Data refreshed successfully");
  };

  const isLoading = driversLoading || earningsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Weekly Earnings Dashboard
          </h1>
          <p className="text-gray-600">
            Track and analyze driver earnings, cash, and toll collections
          </p>
        </div>

        {/* Week Selection Card */}
        <Card className="mb-8 bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Select Week Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <WeeklyCalendar
                selectedWeek={selectedWeek}
                onWeekChange={handleWeekChange}
                className="flex-1"
              />
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh Data"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Drivers</p>
                  <p className="text-3xl font-bold">{drivers.length}</p>
                </div>
                <div className="bg-blue-400 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Earnings</p>
                  <p className="text-3xl font-bold">{weekEarnings.length}</p>
                </div>
                <div className="bg-green-400 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Selected Week</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(selectedWeek.start), 'MMM dd')} - {format(new Date(selectedWeek.end), 'MMM dd')}
                  </p>
                </div>
                <div className="bg-purple-400 p-3 rounded-full">
                  <CalendarIcon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Table */}
        <WeeklyEarningsTable
          earnings={weekEarnings}
          drivers={drivers}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
