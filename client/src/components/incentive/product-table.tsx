import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/types';

interface ProductTableProps {
  products: Product[];
  roleId?: number;
  isEditable?: boolean;
  onProductSelection?: (productId: string, selected: boolean) => void;
  selectedProductIds?: string[];
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  roleId,
  isEditable = false,
  onProductSelection,
  selectedProductIds = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(selectedProductIds);
  
  // Update selected products when selectedProductIds prop changes
  useEffect(() => {
    setSelectedProducts(selectedProductIds);
  }, [selectedProductIds]);
  
  // Handle selection of all products
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = products.map(p => p.id);
      setSelectedProducts(allIds);
      if (onProductSelection) {
        allIds.forEach(id => onProductSelection(id, true));
      }
    } else {
      setSelectedProducts([]);
      if (onProductSelection) {
        products.forEach(p => onProductSelection(p.id, false));
      }
    }
  };
  
  // Handle selection of individual product
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
    
    if (onProductSelection) {
      onProductSelection(productId, checked);
    }
  };
  
  // Filter products based on search query
  const filteredProducts = searchQuery
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.includes(searchQuery.toLowerCase())
      )
    : products;
  
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Global Products & Incentives</h2>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input 
              placeholder="Search products..." 
              className="h-9 w-64 rounded-sm border-gray-300 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {isEditable && (
                <Checkbox 
                  className="rounded-sm" 
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              )}
            </th>
            <th className="px-4 py-3 w-24">ID</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3 w-40">Created</th>
            <th className="px-4 py-3 w-24">Price</th>
            <th className="px-4 py-3 w-24">Sellable</th>
            <th className="px-4 py-3 w-32">Commission</th>
            <th className="px-4 py-3 w-24">Bonus</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredProducts.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {isEditable && (
                  <Checkbox 
                    className="rounded-sm" 
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                  />
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{product.id}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{product.created}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.price || "N/A"}</td>
              <td className="px-4 py-3 text-center">
                {product.isSellable ? (
                  <div className="flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-green-500" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-300" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{product.commission}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{product.bonus}</td>
            </tr>
          ))}
          
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                No products found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;