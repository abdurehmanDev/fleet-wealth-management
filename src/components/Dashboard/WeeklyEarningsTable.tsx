
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Driver, WeeklyEarning } from "@/services/database";

interface WeeklyEarningsTableProps {
  earnings: WeeklyEarning[];
  drivers: Driver[];
  isLoading: boolean;
}

export const WeeklyEarningsTable: React.FC<WeeklyEarningsTableProps> = ({
  earnings,
  drivers,
  isLoading,
}) => {
  const getDriverName = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown Driver';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (earnings.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No earnings data found for the selected week.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Weekly Earnings
          <Badge variant="outline" className="ml-2">
            {earnings.length} driver{earnings.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Week Period</TableHead>
                <TableHead className="text-right">Weekly Earning</TableHead>
                <TableHead className="text-right">Cash</TableHead>
                <TableHead className="text-right">Toll</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((earning) => (
                <TableRow key={earning.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {getDriverName(earning.driver_id)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(earning.week_start_date), 'MMM dd')} - {format(new Date(earning.week_end_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(earning.weekly_earning || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(earning.cash || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(earning.toll || 0)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(earning.total_amount || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Weekly Earnings</div>
              <div className="text-2xl font-bold">
                {formatCurrency(earnings.reduce((sum, e) => sum + (e.weekly_earning || 0), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Cash</div>
              <div className="text-2xl font-bold">
                {formatCurrency(earnings.reduce((sum, e) => sum + (e.cash || 0), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Tolls</div>
              <div className="text-2xl font-bold">
                {formatCurrency(earnings.reduce((sum, e) => sum + (e.toll || 0), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                {formatCurrency(earnings.reduce((sum, e) => sum + (e.total_amount || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
