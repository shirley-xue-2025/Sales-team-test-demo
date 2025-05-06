import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DealMembersSection from '@/components/deals/deal-members-section';
import { Role } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface DealDetailsProps {
  params: {
    id: string;
  };
}

export default function SalesMemberDealDetails({ params }: DealDetailsProps) {
  const dealId = params.id;
  
  // Fetch roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Mock data for the deal
  const deal = {
    id: dealId,
    status: 'Upcoming',
    product: {
      name: 'Starter training',
      category: 'Starter training',
      price: '450,00€'
    },
    customer: {
      id: '5452967',
      name: 'undefined undefined', // This would be filled with actual data in a real app
      email: 'alabbsiriyadh301@gmail.com'
    },
    salesMember: {
      name: 'Abdullah Khatib Cuadrado',
      email: 'abdullah.khatib@myeasybusiness.de'
    },
    paymentMethod: 'Sepa',
    paymentPlan: 'Installment payment',
    paymentDetails: 'Die erste Zahlung über 450,00€ ist am 07.05.2025 fällig. Die nächste Zahlung über 450,00€ wird ab dem 07.06.2025 monatlich und insgesamt 11 mal berechnet. Der Gesamtpreis für 12 Zahlungen beträgt 5.400,00€.',
    summary: {
      subtotal: '450,00€',
      vat: '71,85€',
      total: '450,00€'
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/sales-member/deals">
            <a className="mr-4 p-1 rounded-full hover:bg-gray-100">
              <ArrowLeft size={20} />
            </a>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium">Your deal</h1>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 uppercase text-xs">
                {deal.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-sm">
            preview
          </Button>
          <Button size="sm" className="text-sm bg-blue-600 hover:bg-blue-700">
            Send payment link
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
        {/* Team Members & Roles Section */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Team Members</h2>
          <DealMembersSection 
            availableRoles={roles}
            onMembersChange={(members) => {
              console.log('Members updated:', members);
            }}
          />
        </div>

        {/* Product Section */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">product</h2>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded flex items-center justify-center mr-4">
              <span className="text-xs font-medium text-green-800">ME</span>
            </div>
            <div className="font-medium">{deal.product.name}</div>
          </div>
          
          {/* Payment Plan Box */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{deal.paymentPlan}</h3>
              <div className="text-xl font-bold">{deal.product.price}</div>
            </div>
            <p className="text-xs text-gray-600">
              {deal.paymentDetails}
            </p>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500">Payment methods</h2>
            <Button variant="outline" size="sm" className="text-xs">
              Change payment method
            </Button>
          </div>
          
          <div className="border border-gray-200 rounded-sm p-4 flex justify-between items-center">
            <div className="font-medium">Sepa</div>
            <img 
              src="https://www.sepalogo.eu/wp-content/themes/sepatheme/images/sepa-logo-simple.svg" 
              alt="Sepa" 
              className="h-6" 
            />
          </div>
        </div>

        {/* Customer Section */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">customer</h2>
          
          <div className="overflow-hidden border border-gray-200 rounded-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    e-mail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deal.customer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deal.customer.email}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="p-6">
          <div className="border border-gray-200 rounded-sm p-4">
            <h2 className="text-sm font-medium mb-4">Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{deal.summary.subtotal}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Incl. VAT (19%) :</span>
                <span>{deal.summary.vat}</span>
              </div>
              
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
                <span>In total</span>
                <span>{deal.summary.total} *</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-right text-xs text-gray-500">
        You are currently viewing the site as abdullah.khatib@myeasybusiness.de's account
      </div>
    </div>
  );
}