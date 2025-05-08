import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import RoleComparison from '@/components/incentive/role-comparison';
import { useIncentiveStore } from '@/lib/incentiveStore';
import { Role, Product } from '@/lib/types';

// Static component that doesn't rely on state subscriptions from Zustand
const IncentivePlanContent = ({
  roles,
  products,
  selectedRoles,
  combinedIncentives,
  isEditMode,
  onEditClick,
  onRoleSelectionChange,
  onProductSelectionChange
}: {
  roles: Role[];
  products: Product[];
  selectedRoles: number[];
  combinedIncentives: any;
  isEditMode: boolean;
  onEditClick: () => void;
  onRoleSelectionChange: (roleId: number) => void;
  onProductSelectionChange: (productIds: string[]) => void;
}) => {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Incentive plan</h1>
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-sm">
            default plan
          </span>
        </div>
      </div>
      
      <RoleComparison 
        roles={roles}
        products={products}
        selectedRoles={selectedRoles}
        combinedIncentives={combinedIncentives}
        onRoleSelectionChange={onRoleSelectionChange}
        isEditMode={isEditMode}
        onEditClick={onEditClick}
        onProductSelectionChange={onProductSelectionChange}
      />
    </div>
  );
};

const IncentivePlanPage: React.FC = () => {
  // Local state for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get API data and Zustand state
  const { data: apiRoles } = useQuery<Role[]>({ queryKey: ['/api/roles'] });
  const { data: apiProducts } = useQuery<Product[]>({ queryKey: ['/api/products'] });
  
  const roles = useIncentiveStore(state => state.roles);
  const selectedRoles = useIncentiveStore(state => state.selectedRoles);
  const toggleRoleSelection = useIncentiveStore(state => state.toggleRoleSelection);
  const toggleProductSelection = useIncentiveStore(state => state.toggleProductSelection);
  const setRoles = useIncentiveStore(state => state.setRoles);
  const products = useIncentiveStore(state => state.products);
  const getAllProducts = useIncentiveStore(state => state.getAllProducts);
  const calculateCombinedIncentives = useIncentiveStore(state => state.calculateCombinedIncentives);
  
  // Initialize roles from API when they load
  useEffect(() => {
    if (apiRoles?.length) {
      // Map API roles to our format
      const updatedRoles = apiRoles.map(role => {
        let title = role.title;
        let description = role.description;
        
        if (title === "Sales Manager") {
          title = "Setter";
          description = "Qualifies leads and schedules appointments for closers";
        } else if (title === "Sales Representative") {
          title = "Junior Closer";
          description = "Responsible for converting qualified prospects into clients";
        } else if (title === "Junior Sales") {
          title = "Senior Closer";
          description = "Handles high-value clients and complex sales situations";
        }
        
        return { ...role, title, description };
      });
      
      // Set roles in store
      setRoles(updatedRoles);
      
      // Pre-select all roles by default
      if (selectedRoles.length === 0) {
        updatedRoles.forEach(role => {
          toggleRoleSelection(role.id);
        });
      }
    }
  }, [apiRoles, setRoles]);
  
  // Simple event handlers
  const handleEditClick = () => setIsEditMode(prev => !prev);
  
  const handleProductSelectionChange = (productIds: string[]) => {
    // Calculate what's added and removed
    const currentSelectedIds = products.filter(p => p.selected).map(p => p.id);
    const added = productIds.filter(id => !currentSelectedIds.includes(id));
    const removed = currentSelectedIds.filter(id => !productIds.includes(id));
    
    // Apply the changes
    added.forEach(id => {
      if (selectedRoles.length > 0) {
        toggleProductSelection(id, selectedRoles[0], true);
      }
    });
    
    removed.forEach(id => {
      selectedRoles.forEach(roleId => {
        toggleProductSelection(id, roleId, false);
      });
    });
    
    // Set edit mode if adding new products
    if (added.length > 0 && !isEditMode) {
      setIsEditMode(true);
    }
  };
  
  // Prepare data for the static component
  const allProducts = getAllProducts();
  const incentives = calculateCombinedIncentives();
  
  // Render the static component with data
  return (
    <IncentivePlanContent
      roles={roles}
      products={allProducts}
      selectedRoles={selectedRoles}
      combinedIncentives={incentives}
      isEditMode={isEditMode}
      onEditClick={handleEditClick}
      onRoleSelectionChange={toggleRoleSelection}
      onProductSelectionChange={handleProductSelectionChange}
    />
  );
};

export default IncentivePlanPage;