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
  const getAvailableProductsForSalesMember = useIncentiveStore(state => state.getAvailableProductsForSalesMember);
  const calculateCombinedIncentives = useIncentiveStore(state => state.calculateCombinedIncentives);
  const userMode = useIncentiveStore(state => state.userMode);
  const currentSalesRoleId = useIncentiveStore(state => state.currentSalesRoleId);
  
  // Fetch products when component mounts and on page refresh
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        console.log('Fetching initial products data from server');
        // This waits for the product data to be fully loaded before rendering
        await useIncentiveStore.getState().fetchProducts();
        
        // Force a UI refresh
        useIncentiveStore.getState().setMode(useIncentiveStore.getState().mode);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    
    fetchProductsData();
    
    // Also fetch products data when window is focused/refocused
    // This helps keep the UI in sync with server state after page refresh
    const handleFocus = () => {
      console.log('Window focused, refreshing products data');
      fetchProductsData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
      
      // Re-fetch products since we now have roles
      useIncentiveStore.getState().fetchProducts();
    }
  }, [apiRoles, setRoles]);
  
  // Simple event handlers
  const handleEditClick = () => setIsEditMode(prev => !prev);
  
  const handleProductSelectionChange = async (productIds: string[]) => {
    try {
      console.log('Product selection change handler called with:', productIds);
      
      // If no roles are selected, we can't assign products
      if (selectedRoles.length === 0) {
        console.warn('No roles selected, cannot assign products');
        return;
      }
      
      // Update all selected roles with the new product selection
      for (const roleId of selectedRoles) {
        console.log(`Updating products for role ${roleId} with:`, productIds);
        
        // Use the store's updateRoleProducts method to save to backend
        await useIncentiveStore.getState().updateRoleProducts(roleId, productIds);
      }
      
      // Set edit mode if adding new products
      if (!isEditMode) {
        setIsEditMode(true);
      }
      
      // Refresh the products data to ensure UI is in sync with backend
      await useIncentiveStore.getState().fetchProducts();
      
      console.log('Product selection updated successfully');
    } catch (error) {
      console.error('Failed to update product selection:', error);
    }
  };
  
  // Prepare data for the static component
  // Different product list based on user mode (seller vs sales member)
  const productsToShow = userMode === 'sales' 
    ? getAvailableProductsForSalesMember() 
    : getAllProducts();
  
  // In sales member mode, only show the current role
  const rolesToShow = userMode === 'sales' && currentSalesRoleId
    ? roles.filter(r => r.id === currentSalesRoleId)
    : roles;
    
  // Pre-select the current sales role if in sales member mode
  useEffect(() => {
    if (userMode === 'sales' && currentSalesRoleId && selectedRoles.length === 0) {
      toggleRoleSelection(currentSalesRoleId);
    }
  }, [userMode, currentSalesRoleId, selectedRoles.length, toggleRoleSelection]);
  
  const incentives = calculateCombinedIncentives();
  
  // Debug logs for troubleshooting
  console.log('User Mode:', userMode);
  console.log('Current Sales Role ID:', currentSalesRoleId);
  console.log('Selected Roles:', selectedRoles);
  console.log('Products to Show:', productsToShow);
  console.log('Products Count:', productsToShow?.length || 0);
  console.log('Combined Incentives:', incentives);
  
  // Render the static component with data
  return (
    <IncentivePlanContent
      roles={rolesToShow}
      products={productsToShow}
      selectedRoles={selectedRoles}
      combinedIncentives={incentives}
      isEditMode={isEditMode && userMode === 'seller'} // Only allow edit mode for sellers
      onEditClick={userMode === 'seller' ? handleEditClick : () => {}}
      onRoleSelectionChange={userMode === 'seller' ? toggleRoleSelection : () => {}}
      onProductSelectionChange={userMode === 'seller' ? handleProductSelectionChange : () => {}}
    />
  );
};

export default IncentivePlanPage;