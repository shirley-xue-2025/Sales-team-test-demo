import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/types';

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
  // Sample team members - in a real app, these would come from an API
  const teamMembers = [
    { id: 1, name: 'Abdullah Khalid Cowdwallis', email: 'abdullah@example.com' },
    { id: 2, name: 'Maria Rodriguez', email: 'maria@example.com' },
    { id: 3, name: 'John Smith', email: 'john@example.com' },
    { id: 4, name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: 5, name: 'Luis Garcia', email: 'luis@example.com' },
  ];

  // State for tracking role assignments
  const [dealMembers, setDealMembers] = useState<DealMember[]>(initialMembers.length ? initialMembers : [
    // Default to first team member with first role if no initial members
    { ...teamMembers[0], roleId: availableRoles[0]?.id || 0 }
  ]);

  // Add a new role assignment
  const addRoleAssignment = () => {
    // Find unassigned roles
    const assignedRoleIds = dealMembers.map(m => m.roleId);
    const unassignedRoles = availableRoles.filter(role => !assignedRoleIds.includes(role.id));
    
    if (unassignedRoles.length === 0) return; // All roles assigned
    
    // Default to first unassigned role and first team member not already assigned
    const newRoleId = unassignedRoles[0].id;
    const assignedMemberIds = dealMembers.map(m => m.id);
    const availableMembers = teamMembers.filter(m => !assignedMemberIds.includes(m.id));
    
    const newMember = availableMembers.length > 0 
      ? { ...availableMembers[0], roleId: newRoleId }
      : { ...teamMembers[0], roleId: newRoleId }; // Fallback to first member if all are assigned
    
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

  // Change the role for a member
  const changeRole = (memberIndex: number, newRoleId: number) => {
    const updatedMembers = [...dealMembers];
    updatedMembers[memberIndex] = { 
      ...dealMembers[memberIndex], 
      roleId: newRoleId 
    };
    
    setDealMembers(updatedMembers);
    
    if (onMembersChange) {
      onMembersChange(updatedMembers);
    }
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
    <div className="bg-white rounded-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-700">Sales Members</h2>
        
        {dealMembers.length < availableRoles.length && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addRoleAssignment}
            className="text-xs h-8 px-2 rounded-sm"
          >
            Add role
          </Button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {dealMembers.map((member, index) => {
          const role = availableRoles.find(r => r.id === member.roleId);
          
          return (
            <div key={index} className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5">
                  <Badge variant="outline" className="text-xs bg-gray-50 whitespace-nowrap">
                    {role?.title || 'Unknown role'}
                  </Badge>
                  <div className="text-xs text-gray-500">gets commission plan</div>
                </div>
                
                {dealMembers.length > 1 && (
                  <button 
                    onClick={() => removeAssignment(index)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Select 
                  value={member.id.toString()} 
                  onValueChange={(value) => changeMember(index, Number(value))}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(tm => (
                      <SelectItem key={tm.id} value={tm.id.toString()}>
                        {tm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={member.roleId.toString()}
                  onValueChange={(value) => changeRole(index, Number(value))}
                >
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
        
        {dealMembers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No sales members assigned to this deal.
          </div>
        )}
      </div>
    </div>
  );
}