import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Package } from 'lucide-react';

const Home: React.FC = () => {
  // Mock data for the sales dashboard
  const revenueData = [
    { name: 'Jan', sales: 18000 },
    { name: 'Feb', sales: 24000 },
    { name: 'Mar', sales: 29000 },
    { name: 'Apr', sales: 34000 },
    { name: 'May', sales: 39000 },
  ];

  const salesByProductData = [
    { name: 'Product A', value: 45 },
    { name: 'Product B', value: 28 },
    { name: 'Product C', value: 17 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#a78bfa'];

  const teamPerformance = [
    { name: 'Muhammad Gunes', deals: 7, revenue: '$47,500' },
    { name: 'Sarah Johnson', deals: 5, revenue: '$32,800' },
    { name: 'David Chen', deals: 6, revenue: '$41,200' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Team Dashboard</h1>
        <p className="text-gray-600">
          Track your team's performance and key sales metrics.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center py-6">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">$121,500</h3>
                <span className="flex items-center text-green-600 text-sm ml-2">
                  <ArrowUpRight className="h-4 w-4" />
                  12%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-6">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <TrendingUp className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Deals Closed</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">18</h3>
                <span className="flex items-center text-green-600 text-sm ml-2">
                  <ArrowUpRight className="h-4 w-4" />
                  8%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-6">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <Package className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Deal Size</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">$6,750</h3>
                <span className="flex items-center text-red-600 text-sm ml-2">
                  <ArrowDownRight className="h-4 w-4" />
                  3%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-6">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">3</h3>
                <span className="flex items-center text-green-600 text-sm ml-2">
                  <ArrowUpRight className="h-4 w-4" />
                  New
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#4ade80" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sales by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByProductData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {salesByProductData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-500">TEAM MEMBER</th>
                  <th className="text-left p-3 font-medium text-gray-500">ROLE</th>
                  <th className="text-left p-3 font-medium text-gray-500">DEALS CLOSED</th>
                  <th className="text-left p-3 font-medium text-gray-500">REVENUE GENERATED</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((member, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{member.name}</td>
                    <td className="p-3">Closer</td>
                    <td className="p-3">{member.deals}</td>
                    <td className="p-3">{member.revenue}</td>
                    <td className="p-3 text-right">
                      <Link href="/members">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Link href="/members">
              <Button className="bg-green-600 hover:bg-green-700">
                View All Team Members
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
