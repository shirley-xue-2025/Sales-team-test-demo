import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { showToast } from '@/components/ui/sonner';
import RoleCard from '@/components/sales/role-card';
import RoleForm from '@/components/sales/role-form';
import DeleteRoleDialog from '@/components/sales/delete-role-dialog';
import RoleRecommendationModal from '@/components/sales/role-recommendation-modal';
import { type Role, type RoleInsert } from '@shared/schema';
import { useLocation } from 'wouter';
import { Sparkles } from 'lucide-react';

const RolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [openRoleForm, setOpenRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState<boolean>(false);
  
  // Mock member data with proper email format
  const mockMembers = [
    { id: 1411, name: "Muhammad Gunes", email: "muhammad.gunes@example.com" },
    { id: 1410, name: "Abdallah Khatib Cuadrado", email: "abdallah.khatib@example.com" },
    { id: 416, name: "Fernando Ferreira", email: "fernando.ferreira@example.com" }
  ];
  
  const queryClient = useQueryClient();
  
  // Create a reference to the location setter function
  const [, setLocation] = useLocation();
  
  // Queries
  const rolesQuery = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });
  
  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (role: RoleInsert) => {
      const res = await apiRequest('POST', '/api/roles', role);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/count'] });
      showToast('Role created successfully', {
        description: 'The new role has been added to the system.',
        position: 'top-center',
      });
    },
    onError: (error) => {
      showToast('Failed to create role', {
        description: error.message || 'An error occurred while creating the role.',
        position: 'top-center',
      });
    },
  });
  
  const setRoleAsDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PUT', `/api/roles/${id}/default`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      showToast('Default role updated', {
        description: 'The default role has been updated successfully.',
        position: 'top-center',
      });
    },
    onError: (error) => {
      showToast('Failed to update default role', {
        description: error.message || 'An error occurred while updating the default role.',
        position: 'top-center',
      });
    },
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number, role: RoleInsert }) => {
      const res = await apiRequest('PUT', `/api/roles/${id}`, role);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      showToast('Role updated successfully', {
        description: 'The role has been updated in the system.',
        position: 'top-center',
      });
    },
    onError: (error) => {
      showToast('Failed to update role', {
        description: error.message || 'An error occurred while updating the role.',
        position: 'top-center',
      });
    },
  });
  
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Delete mutation called for role ID:', id);
      const res = await apiRequest('DELETE', `/api/roles/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/roles/count'] });
      showToast('Role deleted successfully', {
        description: 'The role has been removed from the system.',
        position: 'top-center',
      });
    },
    onError: (error) => {
      console.error('Error in delete mutation:', error);
      showToast('Failed to delete role', {
        description: error.message || 'An error occurred while deleting the role.',
        position: 'top-center',
      });
    },
  });
  
  // Event handlers
  const handleAddRole = useCallback(() => {
    setSelectedRole(undefined);
    setOpenRoleForm(true);
  }, []);
  
  const handleEditRole = useCallback((role: Role) => {
    console.log("Editing role:", role);
    // Create a deep copy of the role to avoid any reference issues
    setSelectedRole(JSON.parse(JSON.stringify(role)));
    setOpenRoleForm(true);
  }, []);
  
  const handleDeleteRole = useCallback((id: number) => {
    console.log("Deleting role:", id);
    const role = rolesQuery.data?.find(role => role.id === id);
    if (role) {
      // Create a deep copy of the role to avoid reference issues
      setRoleToDelete(JSON.parse(JSON.stringify(role)));
      // Show the proper dialog
      setIsDeleteDialogOpen(true);
    }
  }, [rolesQuery.data]);
  
  const confirmDeleteRole = useCallback(() => {
    if (roleToDelete !== null) {
      console.log("Confirming deletion of role:", roleToDelete.id);
      // Call the mutation to delete the role
      deleteRoleMutation.mutate(roleToDelete.id);
      // Close the dialog
      setIsDeleteDialogOpen(false);
      // Clear the selected role
      setRoleToDelete(null);
    }
  }, [roleToDelete, deleteRoleMutation]);
  
  const handleFormSubmit = useCallback((data: RoleInsert) => {
    console.log("Form submitted with data:", data);
    
    if (selectedRole) {
      console.log("Updating role:", selectedRole.id, data);
      updateRoleMutation.mutate({ id: selectedRole.id, role: data });
    } else {
      console.log("Creating new role:", data);
      createRoleMutation.mutate(data);
    }
    
    setOpenRoleForm(false);
  }, [selectedRole, updateRoleMutation, createRoleMutation]);
  
  const handleSetAsDefault = useCallback((roleId: number) => {
    setRoleAsDefaultMutation.mutate(roleId);
  }, [setRoleAsDefaultMutation]);
  
  const handleConfigureIncentive = useCallback((roleId: number) => {
    // Navigate to incentive plan page with this role selected
    setLocation(`/incentive-plan?roleId=${roleId}`);
  }, [setLocation]);
  
  // Handler for opening the role recommendation modal
  const handleOpenRecommendation = useCallback(() => {
    setIsRecommendationModalOpen(true);
  }, []);
  
  // Handler for handling a selected recommendation 
  const handleRecommendationSelect = useCallback((roleData: { title: string; description: string; permissions: string[] }) => {
    // Create a new role data object from the recommendation
    const newRole: RoleInsert = {
      title: roleData.title,
      description: roleData.description,
      permissions: roleData.permissions,
      isDefault: false,
    };
    
    // Create the new role
    createRoleMutation.mutate(newRole);
    
    // Show success message
    showToast('AI-recommended role added', {
      description: `The ${roleData.title} role has been added to your sales team.`,
      position: 'top-center',
    });
  }, [createRoleMutation]);
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-40" />
            <div className="flex space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-2/3 mt-1" />
        </div>
        <div className="px-5 py-3 bg-gray-50">
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    ));
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow py-8 px-6 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No roles defined yet</h3>
        <p className="text-gray-600 mb-4">Create your first sales team role to get started</p>
        <Button onClick={handleAddRole}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Role
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">
          {activeTab === 'roles' ? 'Sales Roles' : 'Members (MEB)'}
        </h1>
        <div className="flex space-x-3">
          {activeTab === 'roles' ? (
            <div className="flex space-x-3">
              <Button 
                onClick={handleOpenRecommendation}
                className="text-sm h-9 px-4 py-2 rounded-sm border border-green-600 bg-white text-green-600 hover:bg-green-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Recommended Roles
              </Button>
              <Button 
                onClick={handleAddRole}
                className="text-sm h-9 px-4 py-2 rounded-sm bg-gray-900 text-white hover:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create role
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="text-sm h-9 px-4 py-2 rounded-md border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                Service Hub
              </Button>
              <Button variant="outline" className="text-sm h-9 px-4 py-2 rounded-md border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                Provider account
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Warning banner - can be toggled */}
      <div className="mb-6 bg-red-50 border border-red-200 rounded-sm p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>You've reached your current member limit. Upgrade your plan now and let your team continue to grow.</span>
        </div>
        <div className="flex space-x-3">
          <Button size="sm" className="text-xs h-7 rounded-sm bg-white text-red-600 border border-red-300 hover:bg-red-50">
            Upgrade
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 text-red-600 hover:bg-red-100">
            Hide
          </Button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'members' ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Active members
            </button>
            <button 
              onClick={() => setActiveTab('invitations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'invitations' ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Invitations
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'roles' ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Sales Roles
            </button>
          </div>
        </div>
        
        <div className="p-0">
          {activeTab === 'members' && (
            <div>
              <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">ID</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-5">E-Mail</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {mockMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 text-sm text-gray-800">
                  <div className="col-span-1">{member.id}</div>
                  <div className="col-span-4 font-medium">{member.name}</div>
                  <div className="col-span-5">{member.email}</div>
                  <div className="col-span-2 text-right">
                    <button 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end p-4">
                <Button variant="outline" className="flex items-center border-dashed text-gray-600 hover:text-gray-800 rounded-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Invite members
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'invitations' && (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
              <p className="text-gray-600 mb-4">When you invite team members, they'll appear here</p>
              <Button variant="outline" className="flex items-center mx-auto border-dashed text-gray-600 hover:text-gray-800 rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Invite members
              </Button>
            </div>
          )}
          
          {activeTab === 'roles' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {rolesQuery.isLoading ? (
                renderSkeletons()
              ) : rolesQuery.data && rolesQuery.data.length > 0 ? (
                rolesQuery.data.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                    onConfigureIncentive={handleConfigureIncentive}
                    onSetAsDefault={handleSetAsDefault}
                    totalRoles={rolesQuery.data.length}
                  />
                ))
              ) : (
                renderEmptyState()
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Role form dialog */}
      <RoleForm 
        open={openRoleForm}
        onOpenChange={setOpenRoleForm}
        initialData={selectedRole}
        onSubmit={handleFormSubmit}
      />
      
      {/* Delete confirmation dialog */}
      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setRoleToDelete(null);
        }}
        role={roleToDelete}
        onConfirm={confirmDeleteRole}
      />
      
      {/* Role recommendation modal */}
      <RoleRecommendationModal
        open={isRecommendationModalOpen}
        onOpenChange={setIsRecommendationModalOpen}
        onSelect={handleRecommendationSelect}
        currentRoles={rolesQuery.data || []}
      />
    </div>
  );
};

export default RolesPage;
