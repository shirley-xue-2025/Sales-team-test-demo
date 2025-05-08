import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import RoleComparison from '@/components/incentive/role-comparison';
import { useIncentiveStore, UserMode } from '@/lib/incentiveStore';
import { Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';

const IncentivePlanPage: React.FC = () => {
  // Parse URL parameters
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.includes('?') ? location.substring(location.indexOf('?')) : '');
  const roleIdParam = urlParams.get('roleId');
  
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
    userMode,
    setUserMode,
    currentSalesRoleId,
    setCurrentSalesRole,
    toggleRoleSelection,
    toggleProductSelection,
    calculateCombinedIncentives,
    getAllProducts
  } = useIncentiveStore();
  
  // Handle role ID from URL parameter
  useEffect(() => {
    if (roleIdParam) {
      const roleId = parseInt(roleIdParam);
      if (!isNaN(roleId)) {
        setUserMode('sales');
        setCurrentSalesRole(roleId);
      }
    }
  }, [roleIdParam, setUserMode, setCurrentSalesRole]);
  
  // Once API data is loaded, update store with updated role names
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
      
      // If we're in sales mode but no role is specified, select the first one
      if (userMode === 'sales' && currentSalesRoleId === null && updatedRoles.length > 0) {
        setCurrentSalesRole(updatedRoles[0].id);
      }
    }
  }, [apiRoles, setRoles, selectedRoles.length, toggleRoleSelection, userMode, currentSalesRoleId, setCurrentSalesRole]);
  
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
  
  // Filter products based on user mode
  const visibleProducts = getAllProducts();
  
  // Get current sales role for display
  const currentRole = storeRoles.find(role => role.id === currentSalesRoleId);
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Incentive plan</h1>
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-sm">
            default plan
          </span>
        </div>
        
        {/* Mode switcher */}
        <div className="flex items-center gap-3">
          {userMode === 'sales' && (
            <div className="flex items-center">
              <span className="text-sm mr-2">Role:</span>
              <Select 
                value={currentSalesRoleId?.toString() || ''} 
                onValueChange={(value) => {
                  const roleId = parseInt(value);
                  if (!isNaN(roleId)) {
                    setCurrentSalesRole(roleId);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {storeRoles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={userMode === 'seller' ? 'default' : 'outline'}
              onClick={() => setUserMode('seller')}
              className="rounded-none"
            >
              Seller View
            </Button>
            <Button
              variant={userMode === 'sales' ? 'default' : 'outline'}
              onClick={() => {
                setUserMode('sales');
                if (currentSalesRoleId === null && storeRoles.length > 0) {
                  setCurrentSalesRole(storeRoles[0].id);
                }
              }}
              className="rounded-none"
            >
              Sales Member View
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mode indicator */}
      <div className={`mb-6 p-4 border ${userMode === 'seller' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} rounded-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${userMode === 'seller' ? 'text-blue-500' : 'text-green-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${userMode === 'seller' ? 'text-blue-800' : 'text-green-800'}`}>
              {userMode === 'seller' 
                ? 'Seller View - Configure Products and Incentives' 
                : `Sales Member View - ${currentRole?.title || 'Sales Role'}`}
            </h3>
            <div className={`mt-1 text-sm ${userMode === 'seller' ? 'text-blue-700' : 'text-green-700'}`}>
              {userMode === 'seller'
                ? 'Configure commission percentages and bonus amounts for your sales team roles. Products selected here will be available to sales team members.'
                : `You are viewing available products and incentives as a ${currentRole?.title || 'Sales Member'}. Only sellable products assigned to your role are shown.`}
            </div>
          </div>
        </div>
      </div>
      
      {/* Role Comparison View */}
      <RoleComparison 
        roles={storeRoles}
        products={visibleProducts}
        selectedRoles={selectedRoles}
        combinedIncentives={calculateCombinedIncentives()}
        onRoleSelectionChange={toggleRoleSelection}
        isEditMode={isEditMode && userMode === 'seller'} // Only allow editing in seller mode
        onEditClick={userMode === 'seller' ? handleEditClick : undefined} // Only show edit button in seller mode
        onProductSelectionChange={userMode === 'seller' ? handleProductSelectionChange : undefined} // Only allow product selection in seller mode
      />
    </div>
  );
};

export default IncentivePlanPage;