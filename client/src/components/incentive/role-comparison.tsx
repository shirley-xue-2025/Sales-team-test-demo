import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Role, Product, CombinedIncentive } from '@/lib/types';

interface RoleComparisonProps {
  roles: Role[];
  products: Product[];
  selectedRoles: number[];
  combinedIncentives: CombinedIncentive[];
  onRoleSelectionChange: (roleId: number) => void;
}

const RoleComparison: React.FC<RoleComparisonProps> = ({
  roles,
  products,
  selectedRoles,
  combinedIncentives,
  onRoleSelectionChange
}) => {
  // Get all products that are part of combined incentives
  const relevantProductIds = combinedIncentives.map(ci => ci.productId);
  const relevantProducts = products.filter(p => relevantProductIds.includes(p.id));
  
  // Get a product by ID
  const getProduct = (id: string) => products.find(p => p.id === id);
  
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Role Combination Analysis</h2>
        <p className="text-sm text-gray-600 mt-1">
          Select multiple roles to see how commissions and bonuses combine across your team structure.
        </p>
      </div>
      
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select roles to compare:</h3>
        <div className="flex flex-wrap gap-3">
          {roles.map(role => (
            <label key={role.id} className="flex items-center space-x-2">
              <Checkbox 
                checked={selectedRoles.includes(role.id)} 
                onCheckedChange={() => onRoleSelectionChange(role.id)}
                className="rounded-sm"
              />
              <span className="text-sm font-medium text-gray-700">{role.title}</span>
            </label>
          ))}
        </div>
      </div>
      
      {selectedRoles.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 w-1/4">Product</th>
              {selectedRoles.map(roleId => {
                const role = roles.find(r => r.id === roleId);
                return (
                  <th key={roleId} className="px-4 py-3">
                    {role?.title || `Role ${roleId}`}
                  </th>
                );
              })}
              <th className="px-4 py-3 w-32 text-right">Combined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {relevantProducts.map(product => {
              const combinedIncentive = combinedIncentives.find(ci => ci.productId === product.id);
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {product.name}
                  </td>
                  
                  {selectedRoles.map(roleId => {
                    // This is simplified - in a real app you'd need to fetch the actual commission 
                    // for this specific role and product combination
                    return (
                      <td key={roleId} className="px-4 py-3 text-sm text-gray-600">
                        {product.commission}
                      </td>
                    );
                  })}
                  
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 text-right">
                    {combinedIncentive?.combinedCommission || '-'}
                  </td>
                </tr>
              );
            })}
            
            {/* Bonus Summary Row */}
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-3 text-sm text-gray-800">
                Bonus Summary
              </td>
              
              {selectedRoles.map(roleId => (
                <td key={roleId} className="px-4 py-3 text-sm text-gray-600">
                  Varies by product
                </td>
              ))}
              
              <td className="px-4 py-3 text-sm text-gray-800 text-right">
                Varies by product
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>Select at least one role to see comparison data.</p>
        </div>
      )}
    </div>
  );
};

export default RoleComparison;