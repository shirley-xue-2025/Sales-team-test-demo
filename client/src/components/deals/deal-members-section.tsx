import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/types';
import { Plus, User, Info, Check } from 'lucide-react';

interface DealMember {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

interface DealMembersSectionProps {
  availableRoles: Role[];
  initialMembers?: DealMember[];
  onMembersChange?: (members: DealMember[]) => void;
}

export default function DealMembersSection({
  availableRoles,
  initialMembers = [],
  onMembersChange
}: DealMembersSectionProps) {
  // Sample team members - consistent with our Member page data
  const teamMembers = [
    { id: 1411, name: 'Muhammad Gunes', email: 'muhammad.gunes@example.com' },
    { id: 1410, name: 'Abdullah Khalid', email: 'abdullah.khalid@example.com' },
    { id: 416, name: 'Fernando Ferreira', email: 'fernando.ferreira@example.com' },
  ];

  // Default closer role ID
  const closerRoleId = availableRoles.find(r => r.title === "Closer")?.id || 1;
  const setterRoleId = availableRoles.find(r => r.title === "Setter")?.id || 2;
  const seniorCloserRoleId = availableRoles.find(r => r.title === "Senior Closer")?.id || 3;
  
  // State for tracking role assignments
  const [dealMembers, setDealMembers] = useState<DealMember[]>(initialMembers.length ? initialMembers : [
    // Default to showing myself as a Closer
    { 
      id: 1411, // Current user ID (Muhammad Gunes)
      name: "Muhammad Gunes", 
      email: "muhammad.gunes@example.com",
      roleId: closerRoleId
    }
  ]);
  
  // Initialize with default values if available roles change
  useEffect(() => {
    if (availableRoles.length > 0 && dealMembers.length === 1 && dealMembers[0].id === 1411) {
      const updatedMember = {
        ...dealMembers[0],
        roleId: closerRoleId
      };
      setDealMembers([updatedMember]);
    }
  }, [availableRoles]);

  // Add a new role assignment
  const addRoleAssignment = () => {
    // Find unassigned roles
    const assignedRoleIds = dealMembers.map(m => m.roleId);
    const unassignedRoles = availableRoles.filter(role => !assignedRoleIds.includes(role.id));
    
    if (unassignedRoles.length === 0) return; // All roles assigned
    
    // In this implementation, each role is fixed and predefined
    // We select the next available role in the predefined sequence
    const nextRole = unassignedRoles[0];
    
    // Add a new member with the next available role
    // We start with an empty member that will be selected by the user
    const newMember = { 
      id: 0, // Placeholder ID indicating it needs selection
      name: "Select team member", 
      email: "",
      roleId: nextRole.id // Fixed role ID based on role sequence
    };
    
    const updatedMembers = [...dealMembers, newMember];
    setDealMembers(updatedMembers);
    
    if (onMembersChange) {
      onMembersChange(updatedMembers);
    }
  };

  // Change the member for a role
  const changeMember = (memberIndex: number, newMemberId: number) => {
    const newMember = teamMembers.find(m => m.id === Number(newMemberId));
    if (!newMember) return;
    
    const updatedMembers = [...dealMembers];
    updatedMembers[memberIndex] = { 
      ...newMember, 
      roleId: dealMembers[memberIndex].roleId 
    };
    
    setDealMembers(updatedMembers);
    
    if (onMembersChange) {
      onMembersChange(updatedMembers);
    }
  };

  // Role is fixed for each member based on settings
  // This function is kept for compatibility but would not be used
  const changeRole = (memberIndex: number, newRoleId: number) => {
    // In the new implementation, roles are fixed and don't change
    console.log("Roles are fixed per member in this implementation");
  };

  // Remove a role assignment
  const removeAssignment = (memberIndex: number) => {
    if (dealMembers.length <= 1) return; // Keep at least one role assignment
    
    const updatedMembers = dealMembers.filter((_, index) => index !== memberIndex);
    setDealMembers(updatedMembers);
    
    if (onMembersChange) {
      onMembersChange(updatedMembers);
    }
  };

  return (
    <div>
      {dealMembers.map((member, index) => {
        const role = availableRoles.find(r => r.id === member.roleId);
        
        return (
          <div key={index} className="mb-3">
            <div className="rounded-sm border border-gray-200 p-3">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="mb-2">
                    <Badge variant="outline" className="font-normal rounded-sm bg-gray-50 text-xs">
                      {role?.title || 'Unknown role'}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-gray-50 rounded-full p-1 mr-2">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">{member.name}</div>
                  </div>
                </div>
                {dealMembers.length > 1 && (
                  <button
                    onClick={() => removeAssignment(index)}
                    className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {dealMembers.length < availableRoles.length && (
        <div 
          className="flex items-center justify-center p-2 border border-gray-200 border-dashed rounded-sm cursor-pointer mt-3 hover:bg-gray-50"
          onClick={addRoleAssignment}
        >
          <div className="flex items-center text-gray-500 text-sm">
            <Plus size={14} className="mr-1" />
            <span>Add another role</span>
          </div>
        </div>
      )}
      
      {/* Commission Plan Info - show the current user's role */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-gray-500">Commission plan</div>
          <div className="text-xs text-gray-500 cursor-pointer">
            <Info size={14} className="text-gray-400" />
          </div>
        </div>
        <div className="rounded-sm border border-gray-200">
          <div className="p-3 flex items-center">
            <div className="h-4 w-4 bg-gray-50 border border-gray-300 rounded-full mr-2 flex items-center justify-center">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm">Closer</div>
          </div>
        </div>
      </div>
    </div>
  );
}