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
    calculateCombinedIncentives
  } = useIncentiveStore();
  
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
    }
  }, [apiRoles, setRoles, selectedRoles.length, toggleRoleSelection]);
  
  // Toggle edit mode
  const handleEditClick = () => {
    setIsEditMode(!isEditMode);
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
              Configure commission percentages and bonus amounts for your sales team roles. 
              Use the checkboxes to select which roles to include in the total calculations.
            </div>
          </div>
        </div>
      </div>
      
      {/* Role Comparison View */}
      <RoleComparison 
        roles={storeRoles}
        products={products}
        selectedRoles={selectedRoles}
        combinedIncentives={calculateCombinedIncentives()}
        onRoleSelectionChange={toggleRoleSelection}
        isEditMode={isEditMode}
        onEditClick={handleEditClick}
      />
    </div>
  );
};

export default IncentivePlanPage;