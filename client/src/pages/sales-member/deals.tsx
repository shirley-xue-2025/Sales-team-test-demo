import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Search, Edit, Eye } from 'lucide-react';

interface Deal {
  id: string;
  product: {
    name: string;
    category: string;
  };
  customer: {
    name: string;
    email: string;
  };
  createdOn: string;
  price: string;
  paymentPlan: string;
  status: 'Draft' | 'Upcoming' | 'Ready' | 'Cancelled' | 'Paid';
}

export default function SalesMemberDeals() {
  // Mock data for deals
  const deals: Deal[] = [
    { 
      id: '1827352', 
      product: { name: 'Business Pro', category: 'Business Pro' }, 
      customer: { name: '', email: '' },
      createdOn: '06.05.2025', 
      price: '8,200.00€', 
      paymentPlan: 'Unique', 
      status: 'Draft'
    },
    { 
      id: '1825258', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Riyadh Al-Abbasi', email: 'alabbsiriyadh301@gmail.com' },
      createdOn: '06.05.2025', 
      price: '5,400.00€', 
      paymentPlan: 'Installment payment', 
      status: 'Upcoming'
    },
    { 
      id: '1813196', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Islam Kemal Michael Üstün', email: 'michaeli-m@web.de' },
      createdOn: '04.05.2025', 
      price: '5,400.00€', 
      paymentPlan: 'Installment payment', 
      status: 'Upcoming'
    },
    { 
      id: '1800613', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Ahmad Khaled', email: 'ahmad.khaled@hotmail.de' },
      createdOn: '01.05.2025', 
      price: '450.00€', 
      paymentPlan: 'Installment payment', 
      status: 'Ready'
    },
    { 
      id: '1765980', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Ilhan Shigov', email: 'ilhang291104@gmail.com' },
      createdOn: 'April 25, 2025', 
      price: '0.00€', 
      paymentPlan: 'Installment payment', 
      status: 'Cancelled'
    },
    { 
      id: '1749052', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Alija Avdic', email: 'alija.avdic@gmx.de' },
      createdOn: 'April 23, 2025', 
      price: '4,800.00€', 
      paymentPlan: 'Unique', 
      status: 'Paid'
    },
    { 
      id: '1746899', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Alija Avdic', email: 'alija.avdic@gmx.de' },
      createdOn: 'April 23, 2025', 
      price: '0.00€', 
      paymentPlan: 'Unique', 
      status: 'Cancelled'
    },
    { 
      id: '1746732', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Alija Avdic', email: 'Alija.Avdic@gmx.de' },
      createdOn: 'April 23, 2025', 
      price: '0.00€', 
      paymentPlan: 'Unique', 
      status: 'Cancelled'
    },
    { 
      id: '1746614', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: '', email: '' },
      createdOn: 'April 23, 2025', 
      price: '4,800.00€', 
      paymentPlan: 'Unique', 
      status: 'Draft'
    },
    { 
      id: '1713957', 
      product: { name: 'Starter training', category: 'Starter training' }, 
      customer: { name: 'Lyulzim Gusani', email: 'lulzimgusani@gmail.com' },
      createdOn: 'April 14, 2025', 
      price: '5,400.00€', 
      paymentPlan: 'Installment payment', 
      status: 'Paid'
    }
  ];

  // State for tabs, pagination and filtering
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  // Filter deals based on active tab
  const filteredDeals = activeTab === 'all' 
    ? deals 
    : deals.filter(deal => deal.id !== '1765980' && deal.id !== '1746732'); // Simplified filter for demo
  
  const totalEntries = filteredDeals.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  // Status badge styling
  const getStatusBadge = (status: Deal['status']) => {
    switch (status) {
      case 'Draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>;
      case 'Upcoming':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Upcoming</Badge>;
      case 'Ready':
        return <Badge className="bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300">Ready</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deals</h1>
        <Button variant="outline" className="border-gray-300 text-sm text-gray-700 font-medium">
          Sales Team Member Account
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search deals..."
            className="pl-10 py-2 w-full border border-gray-300 rounded-sm text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 border-gray-300">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Deal Tabs and Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-56">
              <TabsTrigger value="all">All Deals</TabsTrigger>
              <TabsTrigger value="my">My Deals</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created On
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Plan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deal.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-green-800">ME</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{deal.product.name}</div>
                      <div className="text-xs text-gray-500">{deal.product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {deal.customer.name ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deal.customer.name}</div>
                      <div className="text-xs text-gray-500">{deal.customer.email}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.createdOn}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.price}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {deal.paymentPlan}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(deal.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  {deal.status === 'Draft' ? (
                    <Link href={`/sales-member/deals/${deal.id}`}>
                      <a className="p-1 rounded-full inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                        <Edit className="h-5 w-5" />
                      </a>
                    </Link>
                  ) : (
                    <Link href={`/sales-member/deals/${deal.id}`}>
                      <a className="p-1 rounded-full inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                        <Eye className="h-5 w-5" />
                      </a>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1-{Math.min(entriesPerPage, totalEntries)}</span> of{' '}
                <span className="font-medium">{totalEntries}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Page</span>
              <div className="relative z-0 inline-flex shadow-sm rounded-md">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`rounded-l-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </Button>
                
                <Button variant="outline" size="sm" className="rounded-none border-l-0 border-r-0 bg-gray-50">
                  {currentPage}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`rounded-r-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-gray-500">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-sm text-sm p-1"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}