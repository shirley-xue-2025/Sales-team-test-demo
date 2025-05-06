import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  BarChart4,
  PiggyBank,
  Award
} from 'lucide-react';

// Mock data for deals
const dealData = [
  { id: 'DEL-2042', product: 'Premium Plan', customer: 'Acme Corp', price: '$1,200.00', status: 'Paid', date: '2023-04-15', commission: '$120.00', bonus: '$50.00' },
  { id: 'DEL-2039', product: 'Enterprise Solution', customer: 'TechGiant Inc', price: '$5,400.00', status: 'Ready', date: '2023-04-12', commission: '$540.00', bonus: '$150.00' },
  { id: 'DEL-2036', product: 'Business Plan', customer: 'StartUp Labs', price: '$850.00', status: 'Draft', date: '2023-04-10', commission: '$85.00', bonus: '$0.00' },
  { id: 'DEL-2033', product: 'Custom Integration', customer: 'Global Services', price: '$2,200.00', status: 'Upcoming', date: '2023-04-08', commission: '$220.00', bonus: '$75.00' },
  { id: 'DEL-2030', product: 'Premium Plan', customer: 'Local Business', price: '$1,200.00', status: 'Cancelled', date: '2023-04-05', commission: '$0.00', bonus: '$0.00' },
];

// Data for pie chart
const statusData = [
  { name: 'Paid', value: 2, color: '#10b981' },
  { name: 'Ready', value: 3, color: '#3b82f6' },
  { name: 'Draft', value: 1, color: '#9ca3af' },
  { name: 'Upcoming', value: 4, color: '#f59e0b' },
  { name: 'Cancelled', value: 1, color: '#ef4444' },
];

// Monthly commission data for bar chart
const commissionData = [
  { month: 'Jan', commission: 2100, bonus: 550 },
  { month: 'Feb', commission: 1800, bonus: 480 },
  { month: 'Mar', commission: 2400, bonus: 680 },
  { month: 'Apr', commission: 1500, bonus: 420 },
  { month: 'May', commission: 2800, bonus: 780 },
  { month: 'Jun', commission: 3200, bonus: 950 },
];

// Get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Paid':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    case 'Ready':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ready</Badge>;
    case 'Draft':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
    case 'Upcoming':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Upcoming</Badge>;
    case 'Cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const SalesMemberOverview: React.FC = () => {
  // Calculate summary statistics
  const totalDeals = dealData.length;
  const completedDeals = dealData.filter(deal => deal.status === 'Paid').length;
  const completionRate = Math.round((completedDeals / totalDeals) * 100);
  
  const totalCommission = dealData.reduce((sum, deal) => {
    return sum + parseFloat(deal.commission.replace('$', '').replace(',', ''));
  }, 0);
  
  const totalBonus = dealData.reduce((sum, deal) => {
    return sum + parseFloat(deal.bonus.replace('$', '').replace(',', ''));
  }, 0);

  return (
    <div className="container mx-auto py-6 px-6">
      <h1 className="text-2xl font-bold mb-6">Sales Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Commission Earned</p>
                <h2 className="text-3xl font-bold">${totalCommission.toFixed(2)}</h2>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">+12.5% from last month</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Bonus Earned</p>
                <h2 className="text-3xl font-bold">${totalBonus.toFixed(2)}</h2>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">+8.2% from last month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Deals Completed</p>
                <h2 className="text-3xl font-bold">{completedDeals}/{totalDeals}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 font-medium">Completion Rate</span>
                </div>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Progress value={completionRate} className="h-2 mt-4" />
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deals Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">DEAL</th>
                    <th className="pb-2 font-medium">PRODUCT</th>
                    <th className="pb-2 font-medium">PRICE</th>
                    <th className="pb-2 font-medium">STATUS</th>
                    <th className="pb-2 font-medium">COMMISSION</th>
                  </tr>
                </thead>
                <tbody>
                  {dealData.slice(0, 5).map((deal) => (
                    <tr key={deal.id} className="border-b">
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{deal.id}</div>
                          <div className="text-gray-500 text-xs">{deal.customer}</div>
                        </div>
                      </td>
                      <td className="py-3">{deal.product}</td>
                      <td className="py-3">{deal.price}</td>
                      <td className="py-3">{getStatusBadge(deal.status)}</td>
                      <td className="py-3">
                        <div className="font-medium">{deal.commission}</div>
                        <div className="text-gray-500 text-xs">+{deal.bonus} bonus</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Deal Status Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Deal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Performance Chart */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commission">
            <TabsList>
              <TabsTrigger value="commission">Commission & Bonus</TabsTrigger>
              <TabsTrigger value="deals">Deal Volume</TabsTrigger>
            </TabsList>
            <TabsContent value="commission" className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={commissionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => ['$' + value, '']} />
                    <Bar dataKey="commission" name="Commission" fill="#10b981" />
                    <Bar dataKey="bonus" name="Bonus" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="deals" className="pt-4">
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart4 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Deal volume chart coming soon</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Your Role & Incentives */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Your Role & Incentives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-medium mb-2">Current Role</h3>
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Closer</div>
                    <div className="text-xs text-gray-500">Default sales role</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Responsible for finalizing deals with clients and ensuring customer satisfaction with the purchase.
                </p>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium mb-2">Incentive Plan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-medium text-sm">Commission Rate</span>
                  </div>
                  <div className="text-2xl font-bold">10%</div>
                  <div className="text-xs text-gray-500 mt-1">of deal value</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <PiggyBank className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="font-medium text-sm">Bonus Structure</span>
                  </div>
                  <div className="text-2xl font-bold">$50-200</div>
                  <div className="text-xs text-gray-500 mt-1">per qualified deal</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesMemberOverview;