import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

// Mock product data
const mockProducts = [
  { id: "352041", name: "1-on-1 Strategy Session", created: "08.01.2024", commission: "20%", bonus: "0" },
  { id: "349274", name: "Business Growth Masterclass", created: "20.12.2023", commission: "20%", bonus: "0" },
  { id: "302985", name: "Leadership Coaching Program", created: "04.05.2023", commission: "15%", bonus: "0" },
  { id: "302984", name: "Sales Acceleration Workshop", created: "04.06.2023", commission: "0%", bonus: "0" },
  { id: "445504", name: "Marketing Mindset Course", created: "—", commission: "0%", bonus: "0" },
  { id: "443939", name: "CEO Mentoring Package", created: "—", commission: "0%", bonus: "0" },
  { id: "441233", name: "Social Media Authority Program", created: "—", commission: "0%", bonus: "0" },
];

// Updated role names based on request
const roles = [
  { id: 1, name: "Setter", isDefault: true },
  { id: 2, name: "Junior Closer", isDefault: false },
  { id: 3, name: "Senior Closer", isDefault: false },
];

const IncentivePlanPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState('default');
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Incentive plan</h1>
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-sm">
            default plan
          </span>
        </div>
        <Button 
          className="bg-gray-900 hover:bg-gray-800 rounded-sm text-white px-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit plan
        </Button>
      </div>
      
      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Role-based incentives</h3>
            <div className="mt-1 text-sm text-amber-700">
              This is the global incentive plan. You can view and configure specific incentive plans for each role below.
            </div>
          </div>
        </div>
      </div>
      
      {/* Role tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveRole('default')}
          className={`px-4 py-2 text-sm font-medium ${
            activeRole === 'default'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Default Template
        </button>
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.name)}
            className={`px-4 py-2 text-sm font-medium ${
              activeRole === role.name
                ? 'text-gray-800 border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {role.name} {role.isDefault && '(Default)'}
          </button>
        ))}
      </div>
      
      {/* Products table */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Global Products & Incentives</h2>
          <div className="flex items-center">
            <div className="relative mr-2">
              <Input 
                placeholder="Search products..." 
                className="h-9 w-64 rounded-sm border-gray-300 pl-9"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <button className="h-9 w-9 flex items-center justify-center rounded-sm border border-gray-300 text-gray-500 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
          </div>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="w-12 px-4 py-3">
                <Checkbox className="rounded-sm" />
              </th>
              <th className="px-4 py-3 w-24">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 w-40">Created</th>
              <th className="px-4 py-3 w-32">Commission</th>
              <th className="px-4 py-3 w-24">Bonus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mockProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Checkbox className="rounded-sm" />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.created}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{product.commission}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{product.bonus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncentivePlanPage;