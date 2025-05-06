import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Info, Edit, Copy, Settings } from 'lucide-react';
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

  // State for selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('individual');
  
  // State for payment method selection
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(null);
  
  // State for customer type
  const [customerType, setCustomerType] = useState('private');
  
  // State for payment type
  const [paymentType, setPaymentType] = useState('creditCard');

  return (
    <div className="max-w-[1200px] mx-auto px-4 pb-10">
      <div className="flex items-center justify-between pt-4 pb-3">
        <div className="flex items-center">
          <Link href="/deals" className="text-gray-500 hover:text-gray-700 mr-3">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-medium mr-2">deal {params.id}</h1>
          <span className="text-xs uppercase py-0.5 px-2 bg-gray-100 border border-gray-200 rounded-sm">
            {deal.status}
          </span>
        </div>
        <Button size="sm" variant="outline" className="text-sm rounded-sm h-8">
          Sales Team Member Account
        </Button>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-200">
        {/* Product Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-3">product</div>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-green-100 rounded-sm mr-3">
              <span className="text-green-600 font-bold text-sm">ME</span>
            </div>
            <div className="font-medium">
              {deal.product.name}
            </div>
          </div>
        </div>

        {/* Sales Member Section */}
        <div className="border-b border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium text-gray-500 mb-2">Sales Member</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 mr-3">Commission plan</span>
                <Info size={14} className="text-gray-400" />
              </div>
            </div>
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
          </div>
        </div>

        {/* Payment Section */}
        <div className="border-b border-gray-200">
          <div className="px-6 pt-6 pb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-base font-medium">Choose payment method</div>
              <Button variant="secondary" size="sm" className="h-8 rounded-sm text-sm">
                Create a payment plan
              </Button>
            </div>
            
            <div className="border-b border-gray-200 mb-4">
              <div className="flex space-x-6">
                <button
                  className={`px-1 py-2 text-sm font-medium border-b-2 ${
                    selectedPaymentMethod === 'individual' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
                  }`}
                  onClick={() => setSelectedPaymentMethod('individual')}
                >
                  Individual payment options
                </button>
                <button
                  className={`px-1 py-2 text-sm font-medium border-b-2 ${
                    selectedPaymentMethod === 'public' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
                  }`}
                  onClick={() => setSelectedPaymentMethod('public')}
                >
                  Public payment options
                </button>
              </div>
            </div>

            {/* Payment Options */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Option 1 */}
              <div className={`border rounded-sm ${selectedPaymentOption === 'installment' ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}>
                <div className="p-4">
                  <div className="text-sm font-medium mb-1">Installment payment</div>
                  <div className="text-xl font-bold mb-2">450,00€</div>
                  <p className="text-xs text-gray-500 mb-4">
                    Die erste Zahlung über 450,00€ ist am 09.03.2023 fällig. Zwei weitere Zahlungen folgen monatlich. Der Gesamtbetrag beträgt 1.350,00€.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <button className="text-xs font-medium text-gray-700">
                    Individual payment options
                  </button>
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700">
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 2 */}
              <div className={`border rounded-sm ${selectedPaymentOption === 'starter' ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}>
                <div className="p-4">
                  <div className="text-sm font-medium mb-1">Starter training</div>
                  <div className="text-xl font-bold mb-2">1.520,00€</div>
                  <p className="text-xs text-gray-500 mb-4">
                    Die erste Zahlung über 1.520,00€ ist am 09.03.2023 fällig. Der Gesamtbetrag beträgt 1.520,00€.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <button className="text-xs font-medium text-gray-700">
                    Individual payment options
                  </button>
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700">
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 3 */}
              <div className={`border rounded-sm ${selectedPaymentOption === 'unique' ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}>
                <div className="p-4">
                  <div className="text-sm font-medium mb-1">Unique</div>
                  <div className="text-xl font-bold mb-2">4.800,00€</div>
                  <p className="text-xs text-gray-500 mb-4">
                    Die erste Zahlung über 4.800,00€ ist am 09.03.2023 fällig. Der Gesamtbetrag beträgt 4.800,00€.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <button className="text-xs font-medium text-gray-700">
                    Individual payment options
                  </button>
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700">
                      <Edit size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Payment Option */}
            <div className={`border rounded-sm ${selectedPaymentOption === 'starter-partner' ? 'border-green-500' : 'border-gray-200'} overflow-hidden mb-6`}>
              <div className="p-4">
                <div className="text-sm font-medium mb-1">Starter training partner model</div>
                <div className="text-xl font-bold mb-2">600,00€</div>
                <p className="text-xs text-gray-500 mb-4">
                  Die erste Zahlung über 600,00€ ist am 09.03.2023 fällig. Der Gesamtbetrag beträgt 1.200,00€.
                </p>
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button className="text-xs font-medium text-gray-700">
                  Individual payment options
                </button>
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700">
                    <Edit size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Information Section */}
        <div className="border-b border-gray-200">
          <div className="px-6 pt-6 pb-4">
            <div className="text-base font-medium mb-4">Customer Information</div>
            
            <div className="flex space-x-4 mb-6">
              <div className="flex items-center">
                <div className="mr-2 flex items-center justify-center">
                  <input 
                    type="radio" 
                    id="private" 
                    name="customerType" 
                    checked={customerType === 'private'} 
                    onChange={() => setCustomerType('private')} 
                    className="h-4 w-4 text-green-600"
                  />
                </div>
                <label htmlFor="private" className="text-sm">Private individual</label>
              </div>

              <div className="flex items-center">
                <div className="mr-2 flex items-center justify-center">
                  <input 
                    type="radio" 
                    id="partner" 
                    name="customerType" 
                    checked={customerType === 'partner'} 
                    onChange={() => setCustomerType('partner')} 
                    className="h-4 w-4 text-green-600"
                  />
                </div>
                <label htmlFor="partner" className="text-sm">Partner</label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">First name</label>
                <input type="text" className="w-full border border-gray-300 rounded-sm p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last name</label>
                <input type="text" className="w-full border border-gray-300 rounded-sm p-2 text-sm" />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">E-mail</label>
              <input type="email" className="w-full border border-gray-300 rounded-sm p-2 text-sm" />
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Address</label>
              <input type="text" className="w-full border border-gray-300 rounded-sm p-2 text-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Postal code</label>
                <input type="text" className="w-full border border-gray-300 rounded-sm p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">City</label>
                <input type="text" className="w-full border border-gray-300 rounded-sm p-2 text-sm" />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Country</label>
              <select className="w-full border border-gray-300 rounded-sm p-2 text-sm appearance-none pr-8">
                <option>Germany</option>
                <option>Austria</option>
                <option>Switzerland</option>
              </select>
            </div>
            
            <div className="flex items-center mb-4">
              <Checkbox id="different-address" className="mr-2" />
              <label htmlFor="different-address" className="text-sm">Use a different delivery address</label>
            </div>
          </div>
        </div>
        
        {/* Payment Method Section */}
        <div className="border-b border-gray-200">
          <div className="px-6 pt-6 pb-4">
            <div className="text-base font-medium mb-4">Payment method</div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between border border-gray-200 rounded-sm p-3 mb-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="creditCard" 
                    name="paymentType" 
                    checked={paymentType === 'creditCard'} 
                    onChange={() => setPaymentType('creditCard')} 
                    className="h-4 w-4 text-green-600 mr-3"
                  />
                  <label htmlFor="creditCard" className="text-sm">Credit card</label>
                </div>
                <div className="flex space-x-2">
                  <img src="https://cdn.visa.com/v2/assets/images/logos/visa-logo-32x9.svg" alt="Visa" className="h-5" />
                  <img src="https://www.mastercard.com/content/dam/public/mastercardcom/na/us/en/homepage/Home/mc-logo-52.svg" alt="Mastercard" className="h-5" />
                  <img src="https://cdn.maestro.com/maestro/en_US/img/maestro-logo.svg" alt="Maestro" className="h-5" />
                </div>
              </div>
              
              <div className="flex items-center justify-between border border-gray-200 rounded-sm p-3">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="sepa" 
                    name="paymentType" 
                    checked={paymentType === 'sepa'} 
                    onChange={() => setPaymentType('sepa')} 
                    className="h-4 w-4 text-green-600 mr-3"
                  />
                  <label htmlFor="sepa" className="text-sm">Sepa</label>
                </div>
                <div>
                  <img src="https://www.sepalogo.eu/wp-content/themes/sepatheme/images/sepa-logo-simple.svg" alt="Sepa" className="h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Buttons */}
        <div className="px-6 py-4 flex justify-between">
          <button className="text-sm text-red-600 font-medium">
            Delete draft
          </button>
          
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" className="rounded-sm">
              Save draft
            </Button>
            <Button size="sm" className="rounded-sm bg-green-600 hover:bg-green-700">
              Close the deal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetails;