import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ProductTable from '@/components/incentive/product-table';
import RoleComparison from '@/components/incentive/role-comparison';
import { useIncentiveStore } from '@/lib/incentiveStore';
import { Role } from '@/lib/types';

const IncentivePlanPage: React.FC = () => {
  // Get roles data from API or use mock data
  const { data: apiRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });
  
  // Get store state and actions
  const {
    products,
    roles: storeRoles,
    setRoles,
    activeTab,
    setActiveTab,
    mode,
    setMode,
    toggleProductSelection,
    selectedRoles,
    toggleRoleSelection,
    getSelectedProductsForRole,
    getAllProducts,
    calculateCombinedIncentives
  } = useIncentiveStore();
  
  // Once API data is loaded, update store
  useEffect(() => {
    if (apiRoles?.length) {
      setRoles(apiRoles);
    }
  }, [apiRoles, setRoles]);
  
  // Local state for role count detection and UI adaptation
  const [isSingleRole, setIsSingleRole] = useState(false);
  
  // Check if we only have one role and should simplify the UI
  useEffect(() => {
    const roles = storeRoles.length ? storeRoles : [];
    setIsSingleRole(roles.length === 1);
    
    // If we only have one role and there's no active tab, set to that role
    if (roles.length === 1 && activeTab === 'default') {
      setActiveTab(`role-${roles[0].id}`);
    }
  }, [storeRoles, activeTab, setActiveTab]);
  
  // Get role name for display
  const getRoleName = (roleId: number) => {
    const role = storeRoles.find(r => r.id === roleId);
    return role ? role.title : 'Unknown Role';
  };
  
  // Handle product selection for a role
  const handleProductSelection = (productId: string, selected: boolean) => {
    // Extract role ID from active tab
    if (activeTab.startsWith('role-')) {
      const roleId = parseInt(activeTab.replace('role-', ''), 10);
      if (!isNaN(roleId)) {
        toggleProductSelection(productId, roleId, selected);
      }
    }
  };
  
  // Get current selected products based on active tab
  const getCurrentProducts = () => {
    if (activeTab === 'default' || activeTab === 'comparison') {
      return getAllProducts();
    } else if (activeTab.startsWith('role-')) {
      const roleId = parseInt(activeTab.replace('role-', ''), 10);
      if (!isNaN(roleId)) {
        return getSelectedProductsForRole(roleId);
      }
    }
    return [];
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };
  
  // Render role tabs (simplified if only one role)
  const renderRoleTabs = () => {
    if (isSingleRole && storeRoles.length === 1) {
      // For single role scenario, don't show tabs
      return null;
    }
    
    return (
      <div className="flex space-x-1 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('default')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === 'default'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Default Template
        </button>
        
        {storeRoles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveTab(`role-${role.id}`)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === `role-${role.id}`
                ? 'text-gray-800 border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {role.title} {role.isDefault && '(Default)'}
          </button>
        ))}
        
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === 'comparison'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Role Combination
        </button>
      </div>
    );
  };
  
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
          className={`${mode === 'edit' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'} rounded-sm text-white px-4`}
          onClick={toggleEditMode}
        >
          {mode === 'edit' ? (
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
              Edit plan
            </>
          )}
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
              {isSingleRole 
                ? "Configure incentives for your sales role below."
                : "This is the global incentive plan. You can view and configure specific incentive plans for each role below."
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Role tabs - Only show if we have multiple roles */}
      {renderRoleTabs()}
      
      {/* Content based on active tab */}
      {activeTab === 'comparison' ? (
        <RoleComparison 
          roles={storeRoles}
          products={products}
          selectedRoles={selectedRoles}
          combinedIncentives={calculateCombinedIncentives()}
          onRoleSelectionChange={toggleRoleSelection}
        />
      ) : (
        <ProductTable 
          products={getCurrentProducts()}
          isEditable={mode === 'edit'}
          onProductSelection={handleProductSelection}
          selectedProductIds={(activeTab.startsWith('role-') && mode === 'edit') 
            ? getSelectedProductsForRole(parseInt(activeTab.replace('role-', ''), 10)).map(p => p.id)
            : []
          }
        />
      )}
    </div>
  );
};

export default IncentivePlanPage;