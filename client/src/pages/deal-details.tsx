import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import DealMembersSection from '@/components/deals/deal-members-section';
import { Role } from '@/lib/types';

interface DealDetailsProps {
  params: {
    id: string;
  };
}

const DealDetails: React.FC<DealDetailsProps> = ({ params }) => {
  const [deal, setDeal] = useState({
    id: params.id,
    title: 'Starter training',
    status: 'draft',
    created: '2023-05-01',
    product: {
      id: 'prod-1',
      name: 'Starter training',
      price: '1,520.00€',
    }
  });

  // Mock data for roles - in a real app, this would come from an API call
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, title: 'Setter', description: 'Qualifies leads and schedules appointments', isDefault: true, memberCount: 5 },
    { id: 2, title: 'Junior Closer', description: 'Responsible for converting qualified prospects', isDefault: true, memberCount: 3 },
    { id: 3, title: 'Senior Closer', description: 'Handles high-value clients and complex sales', isDefault: true, memberCount: 2 },
  ]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Link href="/deals" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">deal {params.id}</h1>
            <Badge variant="outline" className="uppercase text-xs font-medium">
              {deal.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 border-b">
                <h2 className="text-sm font-medium text-gray-500">product</h2>
                <div className="mt-2 flex items-center">
                  <div className="bg-green-100 rounded-sm h-10 w-10 flex items-center justify-center mr-3">
                    <span className="text-green-600 font-medium">ME</span>
                  </div>
                  <div>
                    <div className="font-medium">{deal.product.name}</div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="payment" className="w-full">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="payment" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Choose payment method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="justify-start h-10">
                          Individual payment options
                        </Button>
                        <Button variant="outline" className="justify-start h-10">
                          Public payment options
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-sm p-4">
                        <div className="font-medium mb-1">Installment payment</div>
                        <div className="text-lg font-bold mb-2">450,00€</div>
                        <div className="text-xs text-gray-500 mb-4">
                          Die erste Zahlung über 450,00€ ist am 09.03.2023 fällig. Zwei weitere Zahlungen folgen monatlich. Der Gesamtbetrag beträgt 1.350,00€.
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Individual payment options
                        </Button>
                      </div>
                      
                      <div className="border rounded-sm p-4">
                        <div className="font-medium mb-1">Starter training</div>
                        <div className="text-lg font-bold mb-2">1.520,00€</div>
                        <div className="text-xs text-gray-500 mb-4">
                          Die erste Zahlung über 1.520,00€ ist am 09.03.2023 fällig. Zwei weitere Zahlungen folgen monatlich. Der Gesamtbetrag beträgt 1.520,00€.
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Individual payment options
                        </Button>
                      </div>
                      
                      <div className="border rounded-sm p-4">
                        <div className="font-medium mb-1">Unique</div>
                        <div className="text-lg font-bold mb-2">4.800,00€</div>
                        <div className="text-xs text-gray-500 mb-4">
                          Die erste Zahlung über 4.800,00€ ist am 09.03.2023 fällig. Der Gesamtbetrag beträgt 4.800,00€.
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Individual payment options
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="customer" className="p-6">
                  <h3 className="font-medium mb-4">Customer information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">First name</label>
                        <input
                          type="text"
                          className="w-full border rounded-sm p-2 text-sm"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Last name</label>
                        <input
                          type="text"
                          className="w-full border rounded-sm p-2 text-sm"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full border rounded-sm p-2 text-sm"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="p-6">
                  <h3 className="font-medium mb-4">Deal history</h3>
                  <div className="space-y-4">
                    <div className="border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-sm font-medium">Deal created</div>
                      <div className="text-xs text-gray-500">May 1, 2023 at 10:23 AM</div>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-sm font-medium">Payment method selected</div>
                      <div className="text-xs text-gray-500">May 1, 2023 at 10:25 AM</div>
                    </div>
                    <div className="border-l-2 border-gray-200 pl-4 py-1">
                      <div className="text-sm font-medium">Product changed</div>
                      <div className="text-xs text-gray-500">May 1, 2023 at 10:30 AM</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Deal Members Section */}
          <DealMembersSection 
            availableRoles={roles}
            initialMembers={[
              { 
                id: 1, 
                name: 'Abdullah Khalid Cowdwallis', 
                email: 'abdullah@example.com',
                roleId: 2 // Junior Closer
              }
            ]}
            onMembersChange={(members) => {
              console.log('Members updated:', members);
            }}
          />
          
          <div className="mt-6">
            <Button variant="outline" className="w-full justify-between text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete draft
              <span className="sr-only">Delete draft</span>
            </Button>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button variant="outline">Save draft</Button>
            <Button>Close the deal</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetails;