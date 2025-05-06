import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { showToast } from '@/components/ui/sonner';
import RoleCard from '@/components/sales/role-card';
import RoleForm from '@/components/sales/role-form';
import { type Role, type RoleInsert } from '@shared/schema';

const RolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [openRoleForm, setOpenRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  
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
      await apiRequest('DELETE', `/api/roles/${id}`);
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
      showToast('Failed to delete role', {
        description: error.message || 'An error occurred while deleting the role.',
        position: 'top-center',
      });
    },
  });
  
  // Event handlers
  const handleAddRole = () => {
    setSelectedRole(undefined);
    setOpenRoleForm(true);
  };
  
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setOpenRoleForm(true);
  };
  
  const handleDeleteRole = (id: number) => {
    setRoleToDelete(id);
  };
  
  const confirmDeleteRole = () => {
    if (roleToDelete !== null) {
      deleteRoleMutation.mutate(roleToDelete);
      setRoleToDelete(null);
    }
  };
  
  const handleFormSubmit = (data: RoleInsert) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, role: data });
    } else {
      createRoleMutation.mutate(data);
    }
    setOpenRoleForm(false);
  };
  
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Sales Team Roles</h1>
        <Button onClick={handleAddRole}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Role
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 border-b w-full bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="roles"
            className={`tab-button ${activeTab === 'roles' ? 'active' : 'inactive'}`}
          >
            Roles Management
          </TabsTrigger>
          <TabsTrigger 
            value="team"
            className={`tab-button ml-8 ${activeTab === 'team' ? 'active' : 'inactive'}`}
          >
            Team Assignment
          </TabsTrigger>
          <TabsTrigger 
            value="permissions"
            className={`tab-button ml-8 ${activeTab === 'permissions' ? 'active' : 'inactive'}`}
          >
            Permission Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="pt-4">
          {rolesQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderSkeletons()}
            </div>
          ) : rolesQuery.data?.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rolesQuery.data?.map((role) => (
                <RoleCard 
                  key={role.id} 
                  role={role} 
                  onEdit={handleEditRole} 
                  onDelete={handleDeleteRole} 
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="team" className="pt-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Assignment</h3>
              <p className="text-gray-600 mb-4">This feature will be implemented soon.</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="permissions" className="pt-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Permission Settings</h3>
              <p className="text-gray-600 mb-4">This feature will be implemented soon.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Role form dialog */}
      <RoleForm 
        open={openRoleForm}
        onOpenChange={setOpenRoleForm}
        initialData={selectedRole}
        onSubmit={handleFormSubmit}
      />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={roleToDelete !== null} onOpenChange={(isOpen) => !isOpen && setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              role and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesPage;
