import React, { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Role, Product, CombinedIncentive } from '@/lib/types';
import ProductSelectionModal from './product-selection-modal';

interface RoleComparisonProps {
  roles: Role[];
  products: Product[];
  selectedRoles: number[];
  combinedIncentives: CombinedIncentive[];
  onRoleSelectionChange: (roleId: number) => void;
  isEditMode?: boolean;
  onEditClick?: () => void;
  onProductSelectionChange?: (productIds: string[]) => void;
}

const RoleComparison: React.FC<RoleComparisonProps> = ({
  roles,
  products,
  selectedRoles,
  combinedIncentives,
  onRoleSelectionChange,
  isEditMode = false,
  onEditClick,
  onProductSelectionChange
}) => {
  
  // Get all products that are relevant for display
  // If no incentives are returned but roles are selected, we should show all products
  const relevantProductIds = combinedIncentives.map(ci => ci.productId);
  const relevantProducts = selectedRoles.length > 0 && relevantProductIds.length === 0 
    ? products 
    : products.filter(p => relevantProductIds.includes(p.id) || selectedRoles.length === 0);
  
  // State for product selection modal
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  // State to track newly added products for highlighting and focusing
  const [newlyAddedProductIds, setNewlyAddedProductIds] = useState<string[]>([]);
  // State to hold the current view of products while the modal is open - this prevents changes from affecting the table
  const [displayedProductIds, setDisplayedProductIds] = useState<string[]>(relevantProductIds);
  // Ref for the first input field of newly added products
  const firstNewInputRef = useRef<HTMLInputElement | null>(null);
  
  // State for edited values
  const [editedValues, setEditedValues] = useState<Record<string, Record<string, { commission: string; bonus: string }>>>({});
  
  // Handle edit input change
  const handleEditChange = (productId: string, roleId: number, type: 'commission' | 'bonus', value: string) => {
    setEditedValues(prev => {
      const productKey = productId;
      const roleKey = roleId.toString();
      
      return {
        ...prev,
        [productKey]: {
          ...(prev[productKey] || {}),
          [roleKey]: {
            ...(prev[productKey]?.[roleKey] || { commission: '', bonus: '' }),
            [type]: value
          }
        }
      };
    });
  };
  
  // Calculate total values for a product
  const calculateTotals = (product: Product) => {
    if (selectedRoles.length === 0) {
      return { commission: '0%', bonus: '0€' };
    }
    
    let totalCommission = 0;
    let totalBonus = 0;
    
    selectedRoles.forEach(roleId => {
      const roleKey = roleId.toString();
      const productKey = product.id;
      
      // Check if there's an edited value
      if (editedValues[productKey]?.[roleKey]) {
        const commission = editedValues[productKey][roleKey].commission;
        const bonus = editedValues[productKey][roleKey].bonus;
        
        totalCommission += parseFloat(commission.replace('%', '') || '0');
        totalBonus += parseFloat(bonus.replace('€', '') || '0');
      } else {
        // Use default value from product
        totalCommission += parseFloat(product.commission.replace('%', '') || '0');
        totalBonus += parseFloat(product.bonus.replace('€', '') || '0');
      }
    });
    
    return {
      commission: `${totalCommission}%`,
      bonus: `${totalBonus}€`
    };
  };
  
  // Effect to focus on the first input of newly added products when in edit mode
  useEffect(() => {
    if (isEditMode && newlyAddedProductIds.length > 0 && firstNewInputRef.current) {
      firstNewInputRef.current.focus();
    }
  }, [isEditMode, newlyAddedProductIds]);
  
  // Update displayedProductIds when relevantProductIds changes from server/parent
  useEffect(() => {
    setDisplayedProductIds(relevantProductIds);
  }, [relevantProductIds]);
  
  // When opening the product selection modal, update displayedProductIds
  const handleOpenProductSelection = () => {
    // Store the current relevant product IDs so we can use them in the modal
    setDisplayedProductIds(relevantProductIds);
    
    // Debug logging
    console.log('Opening product selection modal with:');
    console.log('- Products:', products);
    console.log('- Products count:', products.length);
    console.log('- Selected product IDs:', displayedProductIds);
    
    setIsProductSelectionOpen(true);
  };
  
  // Handle product selection
  const handleProductSelection = async (selectedProductIds: string[]) => {
    if (onProductSelectionChange) {
      try {
        console.log('Product selection changed to:', selectedProductIds);
        console.log('Previous relevant products:', relevantProductIds);
        
        // Identify newly added products
        const newlyAdded = selectedProductIds.filter(id => !relevantProductIds.includes(id));
        setNewlyAddedProductIds(newlyAdded);

        // Notify parent component about the selection, which will update store and save to backend
        await onProductSelectionChange(selectedProductIds);
        
        // After applying changes, close the modal to avoid confusion
        setIsProductSelectionOpen(false);
        
        console.log('Product selection saved successfully');
      } catch (error) {
        console.error('Failed to save product selection:', error);
        // You could add a toast notification here to inform the user of the error
      }
    }
  };
  
  // Get display value for a cell
  const getCellValue = (product: Product, roleId: number, type: 'commission' | 'bonus') => {
    const productKey = product.id;
    const roleKey = roleId.toString();
    
    if (editedValues[productKey]?.[roleKey]?.[type]) {
      return editedValues[productKey][roleKey][type];
    }
    
    return type === 'commission' ? product.commission : product.bonus;
  };
  
  // Create an array of roles to show in the header
  const displayRoles = roles.filter(role => selectedRoles.includes(role.id));
  
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Team incentive overview</h2>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleOpenProductSelection}
            variant="outline"
            className="rounded-sm border-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
            Change products
          </Button>
          
          {onEditClick && (
            <Button 
              onClick={onEditClick}
              className={`${isEditMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'} rounded-sm text-white px-4`}
            >
              {isEditMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save changes
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit incentives
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Role selection section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Simulate Team Collaboration Scenarios</h3>
        <p className="text-xs text-gray-600 mb-3">
          Select different combinations of roles to see how commissions and bonuses would be distributed when team members collaborate on the same deal.
          For example, you can check what happens when a Setter and Closer work together versus a Setter and Senior Closer.
        </p>
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
      
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3" rowSpan={2}>Product</th>
            <th className="px-2 py-3 text-center" rowSpan={2}>Price</th>
            <th className="px-2 py-3 text-center" rowSpan={2}>Sellable</th>
            
            {/* Display columns for selected roles */}
            {displayRoles.map(role => (
              <th key={role.id} className="px-2 py-3 text-center border-b-0" colSpan={2}>
                {role.title}
              </th>
            ))}
            
            {/* Total columns - always show */}
            <th className="px-2 py-3 text-center border-b-0 bg-green-50 border-l border-gray-200" colSpan={2}>
              <span className="text-green-800">Total</span>
            </th>
          </tr>
          
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {/* Show columns for all selected roles */}
            {selectedRoles.map(roleId => [
              <th className="px-2 py-3 text-center w-20" key={`comm-${roleId}`}>Comm. %</th>,
              <th className="px-2 py-3 text-center w-20" key={`bonus-${roleId}`}>Bonus €</th>
            ]).flat()}
            
            {/* Total column headers - always show */}
            <th className="px-2 py-3 text-center w-20 bg-green-50 font-semibold text-gray-600 border-l border-gray-200">Comm. %</th>
            <th className="px-2 py-3 text-center w-20 bg-green-50 font-semibold text-gray-600">Bonus €</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-200 bg-white">
          {relevantProducts.map((product, productIndex) => {
            const totals = calculateTotals(product);
            const isNewlyAdded = newlyAddedProductIds.includes(product.id);
            
            return (
              <tr key={product.id} className={`hover:bg-gray-50 ${isNewlyAdded ? 'bg-green-50/20' : ''}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {product.name}
                  {isNewlyAdded && <span className="ml-2 text-xs text-green-600">(New)</span>}
                </td>
                <td className="px-2 py-2 text-sm text-center text-gray-600 font-medium">
                  {product.price || "N/A"}
                </td>
                <td className="px-2 py-2 text-center">
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
                
                {/* Display cells for each role */}
                {selectedRoles.map((roleId, roleIndex) => [
                  <td key={`comm-cell-${roleId}-${product.id}`} className="px-2 py-2 text-sm text-center text-gray-600">
                    {isEditMode ? (
                      <Input
                        type="text"
                        className="h-8 text-center"
                        value={getCellValue(product, roleId, 'commission')}
                        onChange={(e) => handleEditChange(product.id, roleId, 'commission', e.target.value)}
                        ref={isNewlyAdded && productIndex === 0 && roleIndex === 0 ? firstNewInputRef : undefined}
                      />
                    ) : (
                      getCellValue(product, roleId, 'commission')
                    )}
                  </td>,
                  <td key={`bonus-cell-${roleId}-${product.id}`} className="px-2 py-2 text-sm text-center text-gray-600">
                    {isEditMode ? (
                      <Input
                        type="text"
                        className="h-8 text-center"
                        value={getCellValue(product, roleId, 'bonus')}
                        onChange={(e) => handleEditChange(product.id, roleId, 'bonus', e.target.value)}
                      />
                    ) : (
                      getCellValue(product, roleId, 'bonus')
                    )}
                  </td>
                ]).flat()}
                
                {/* Total columns - always show */}
                <td className="px-2 py-2 text-sm font-semibold text-center text-green-800 bg-green-50 border-l border-gray-200">
                  {totals.commission}
                </td>
                <td className="px-2 py-2 text-sm font-semibold text-center text-green-800 bg-green-50">
                  {totals.bonus}
                </td>
              </tr>
            );
          })}
          
          {relevantProducts.length === 0 && (
            <tr>
              <td colSpan={selectedRoles.length * 2 + 5} className="p-8 text-center text-gray-500">
                {selectedRoles.length === 0 
                  ? "Select at least one role to see comparison data." 
                  : "No products available for the selected roles."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Product Selection Modal */}
      <ProductSelectionModal
        open={isProductSelectionOpen}
        onOpenChange={setIsProductSelectionOpen}
        products={products}
        selectedProductIds={displayedProductIds}
        onSelectProducts={handleProductSelection}
      />
    </div>
  );
};

export default RoleComparison;