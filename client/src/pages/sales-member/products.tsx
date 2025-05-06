import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, X, Filter, Search, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  commission: string;
  bonus: string;
  salesReleased: boolean;
}

export default function SalesMemberProducts() {
  // Mock data for products
  const products: Product[] = [
    { 
      id: '348225', 
      name: 'Starter Training 2.0', 
      category: 'Starter training', 
      price: '7,680.00€', 
      commission: '7.0 %', 
      bonus: '0', 
      salesReleased: false 
    },
    { 
      id: '312607', 
      name: 'Business Pro', 
      category: 'Business Pro', 
      price: '8,200.00€', 
      commission: '7.0 %', 
      bonus: '0', 
      salesReleased: true 
    },
    { 
      id: '309200', 
      name: 'Starter training', 
      category: 'Starter training', 
      price: '4,800.00€', 
      commission: '7.0 %', 
      bonus: '0', 
      salesReleased: true 
    },
    { 
      id: '308748', 
      name: 'Starter training', 
      category: 'All payment plans', 
      price: '2,155.39€', 
      commission: '7.0 %', 
      bonus: '0', 
      salesReleased: false 
    }
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
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
            placeholder="Search products..."
            className="pl-10 py-2 w-full border border-gray-300 rounded-sm text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 border-gray-300">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
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
                Sales Release
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bonus
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-green-800">ME</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {product.salesReleased ? (
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-1" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <X className="h-5 w-5 text-gray-400 mr-1" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.price}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.commission}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.bonus}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  {product.salesReleased ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-sm text-xs h-8"
                    >
                      Create a deal
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-sm text-xs h-8"
                      disabled
                    >
                      Create a deal
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}