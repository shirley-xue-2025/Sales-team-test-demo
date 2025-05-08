import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import RoleComparison from '@/components/incentive/role-comparison';
import { useIncentiveStore } from '@/lib/incentiveStore';
import { Role } from '@/lib/types';

const IncentivePlanPage: React.FC = () => {
  // Get roles data from API or use mock data
  const { data: apiRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });
  
  // Local state for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get store state and actions
  const {
    products,
    roles: storeRoles,
    setRoles,
    selectedRoles,
    toggleRoleSelection,
    toggleProductSelection,
    calculateCombinedIncentives,
    getAllProducts
  } = useIncentiveStore();
  
  // Once API data is loaded, update store with updated role names and fetch products
  useEffect(() => {
    if (apiRoles?.length) {
      // Map Sales Manager → Setter, Sales Representative → Junior Closer, Junior Sales → Senior Closer
      const updatedRoles = apiRoles.map(role => {
        // Update the role names and descriptions if needed
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
        
        return {
          ...role,
          title,
          description
        };
      });
      
      setRoles(updatedRoles);
      
      // Pre-select all roles by default if no roles are selected yet
      if (selectedRoles.length === 0 && updatedRoles.length > 0) {
        updatedRoles.forEach(role => toggleRoleSelection(role.id));
      }
    }
  }, [apiRoles, setRoles, selectedRoles.length, toggleRoleSelection]);

  // Fetch products when the component mounts or roles change
  const { fetchProducts, isLoadingProducts } = useIncentiveStore(state => ({
    fetchProducts: state.fetchProducts,
    isLoadingProducts: state.isLoadingProducts
  }));

  useEffect(() => {
    if (storeRoles.length > 0) {
      fetchProducts();
    }
  }, [fetchProducts, storeRoles.length]);
  
  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Handle product selection changes
  const handleProductSelectionChange = (productIds: string[]) => {
    // For this demo, we're simulating the effect by toggling each product's selection
    // In a real app, this would update a database or store
    
    // First, identify which products were added or removed
    const currentSelectedIds = products.filter(p => p.selected).map(p => p.id);
    const added = productIds.filter(id => !currentSelectedIds.includes(id));
    const removed = currentSelectedIds.filter(id => !productIds.includes(id));
    
    // Update product selections
    added.forEach(id => {
      // For a newly added product, find the first role to assign to
      if (selectedRoles.length > 0) {
        toggleProductSelection(id, selectedRoles[0], true);
      }
    });
    
    removed.forEach(id => {
      // For a removed product, remove from all roles
      selectedRoles.forEach(roleId => {
        toggleProductSelection(id, roleId, false);
      });
    });
    
    // If we added new products, switch to edit mode to allow setting values
    if (added.length > 0 && !isEditMode) {
      setIsEditMode(true);
    }
  };
  
  // Get all products
  const visibleProducts = getAllProducts();
  
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
      
      {/* Role Comparison View */}
      <RoleComparison 
        roles={storeRoles}
        products={visibleProducts}
        selectedRoles={selectedRoles}
        combinedIncentives={calculateCombinedIncentives()}
        onRoleSelectionChange={toggleRoleSelection}
        isEditMode={isEditMode}
        onEditClick={handleEditClick}
        onProductSelectionChange={handleProductSelectionChange}
      />
    </div>
  );
};

export default IncentivePlanPage;