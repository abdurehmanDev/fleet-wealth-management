
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Building2, BarChart3 } from "lucide-react";

interface EarningsChartProps {
  data: Array<{
    week?: string;
    driver?: string;
    amount?: number;
    company?: number;
    drivers?: number;
    owner?: number;
  }>;
  type: 'all-drivers' | 'company';
  title: string;
}

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
  company: {
    label: "Company Total",
    color: "hsl(var(--chart-1))",
  },
  drivers: {
    label: "Driver Payouts", 
    color: "hsl(var(--chart-2))",
  },
  owner: {
    label: "Owner Share",
    color: "hsl(var(--chart-3))",
  },
};

const EarningsChart = ({ data, type, title }: EarningsChartProps) => {
  if (data.length === 0) {
    return (
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-b-2 border-gray-100">
          <CardTitle className="flex items-center gap-3 text-xl">
            {type === 'all-drivers' ? (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            ) : (
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            )}
            <span className="font-bold text-gray-800">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <div className="text-gray-500">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500">Start adding earnings data to see beautiful charts here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-b-2 border-gray-100">
        <CardTitle className="flex items-center gap-3 text-xl">
          {type === 'all-drivers' ? (
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          ) : (
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          )}
          <span className="font-bold text-gray-800">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <ChartContainer config={chartConfig} className="min-h-[400px]">
          {type === 'all-drivers' ? (
            <BarChart data={data} margin={{ top: 30, right: 40, left: 20, bottom: 80 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.7} />
              <XAxis 
                dataKey="driver" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                stroke="#6b7280"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label) => `Driver: ${label}`}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Total Earnings"]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="url(#barGradient)"
                name="amount"
                radius={[6, 6, 0, 0]}
                stroke="#1d4ed8"
                strokeWidth={1}
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 30, right: 40, left: 20, bottom: 80 }}>
              <defs>
                <linearGradient id="companyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="driversGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="ownerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.7} />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                stroke="#6b7280"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label) => `Week: ${label}`}
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`, 
                  name === 'company' ? 'Company Total' : name === 'drivers' ? 'Driver Payouts' : 'Owner Share'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="company" 
                stroke="#3b82f6" 
                strokeWidth={4}
                dot={{ fill: "#3b82f6", strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, fill: "#1d4ed8", strokeWidth: 2, stroke: "#fff" }}
              />
              <Line 
                type="monotone" 
                dataKey="drivers" 
                stroke="#10b981" 
                strokeWidth={4}
                dot={{ fill: "#10b981", strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
              />
              <Line 
                type="monotone" 
                dataKey="owner" 
                stroke="#f59e0b" 
                strokeWidth={4}
                dot={{ fill: "#f59e0b", strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, fill: "#d97706", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EarningsChart;
