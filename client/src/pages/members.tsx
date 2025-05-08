import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Role } from '@/lib/types';
import { RoleInsert } from '@shared/schema';
import { Settings, MoreVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import RoleForm from '@/components/sales/role-form';
import { showToast } from '@/components/ui/sonner';
import { useLocation } from 'wouter';

interface Member {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export default function MembersPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('active');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // We're using Role from lib/types but RoleForm expects Role from shared/schema
  // This is a temporary solution for the type compatibility
  const [selectedRole, setSelectedRole] = useState<any>(undefined);
  
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (role: RoleInsert) => {
      const res = await apiRequest('POST', '/api/roles', role);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
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

  // Mock members data with state - using only Closer role
  const [members, setMembers] = useState<Member[]>([
    { id: 1411, name: 'Muhammad Gunes', email: 'muhammad.gunes@example.com', roleId: 5 }, // Closer role
    { id: 1422, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', roleId: 5 }, // Closer role
    { id: 1437, name: 'David Chen', email: 'david.chen@example.com', roleId: 5 }, // Closer role
  ]);

  // Mock pending invitations with state
  const [invitations, setInvitations] = useState([
    { email: 'john.doe@example.com', roleId: 5, sentAt: '2023-05-01T10:00:00Z' }, // Closer role
  ]);

  const handleSendInvitation = () => {
    // In a real app, this would send an API request
    console.log('Sending invitation to:', inviteEmail, 'with role:', selectedRoleId);
    
    // Close modal and reset form
    setInviteModalOpen(false);
    setInviteEmail('');
    setSelectedRoleId('');
  };
  
  const handleAddRole = () => {
    setSelectedRole(undefined);
    setRoleFormOpen(true);
  };
  
  const handleFormSubmit = (data: RoleInsert) => {
    if (selectedRole) {
      // Update existing role
      console.log("Updating role:", selectedRole.id, data);
      // Call the API to update the role
      apiRequest('PUT', `/api/roles/${selectedRole.id}`, data)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
          showToast('Role updated successfully', {
            description: 'The role has been updated in the system.',
            position: 'top-center',
          });
        })
        .catch(error => {
          showToast('Failed to update role', {
            description: error.message || 'An error occurred while updating the role.',
            position: 'top-center',
          });
        });
    } else {
      // Create new role
      createRoleMutation.mutate(data);
    }
    setRoleFormOpen(false);
    setSelectedRole(undefined);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {activeTab === 'roles' ? 'Sales Roles' : 'My Sales Team'}
        </h1>
        <div className="flex space-x-2">
          {activeTab === 'roles' ? (
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
          ) : (
            <Button 
              onClick={() => setInviteModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Invite members
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="active">Active members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="roles">Sales Roles</TabsTrigger>
        </TabsList>

        {/* Active Members Tab */}
        <TabsContent value="active" className="border rounded-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-gray-500">
                <th className="px-4 py-3 w-32">ID</th>
                <th className="px-4 py-3">NAME</th>
                <th className="px-4 py-3">E-MAIL</th>
                <th className="px-4 py-3">ROLE</th>
                <th className="px-4 py-3 text-right w-32">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const memberRole = roles.find(r => r.id === member.roleId);
                return (
                  <tr key={member.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{member.id}</td>
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3 text-sm">{member.email}</td>
                    <td className="px-4 py-3">
                      <Select 
                        value={member.roleId.toString()} 
                        onValueChange={(value) => {
                          console.log(`Changing ${member.name}'s role to ${value}`);
                          // Update the member in our state
                          const roleId = parseInt(value);
                          setMembers(prevMembers => 
                            prevMembers.map(m => 
                              m.id === member.id ? { ...m, roleId } : m
                            )
                          );
                          // In a real app, this would also update via API
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm w-44">
                          <SelectValue placeholder="Select role">
                            {memberRole?.title || "Select role"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="border rounded-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-gray-500">
                <th className="px-4 py-3">E-MAIL</th>
                <th className="px-4 py-3">ROLE</th>
                <th className="px-4 py-3">SENT AT</th>
                <th className="px-4 py-3 text-right w-32">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation, index) => {
                const invitationRole = roles.find(r => r.id === invitation.roleId);
                return (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">{invitation.email}</td>
                    <td className="px-4 py-3">
                      <Select 
                        value={invitation.roleId.toString()} 
                        onValueChange={(value) => {
                          console.log(`Changing ${invitation.email}'s role to ${value}`);
                          // Update the invitation in our state
                          const roleId = parseInt(value);
                          setInvitations(prevInvitations => 
                            prevInvitations.map((inv, idx) => 
                              idx === index ? { ...inv, roleId } : inv
                            )
                          );
                          // In a real app, this would also update via API
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm w-44">
                          <SelectValue placeholder="Select role">
                            {invitationRole?.title || "Select role"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(invitation.sentAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        Resend
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TabsContent>

        {/* Sales Roles Tab */}
        <TabsContent value="roles" className="border-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white border border-gray-200 rounded-sm shadow-sm">
                <div className="flex justify-between items-start p-5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-medium text-gray-900">{role.title}</h3>
                      {role.isDefault && (
                        <span className="px-2 py-0.5 text-xs rounded-sm bg-gray-100 text-gray-600">Default</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                  </div>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleFormOpen(true);
                          }}
                        >
                          Edit role
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setLocation(`/incentive-plan?roleId=${role.id}`);
                          }}
                        >
                          Configure incentive plan
                        </DropdownMenuItem>
                        
                        {!role.isDefault && (
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              // In a real app, API call to set as default would go here
                              console.log("Setting role as default:", role.id);
                            }}
                          >
                            Set as default
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-red-600 cursor-pointer"
                          disabled={roles.length <= 1}
                          onClick={() => {
                            if (roles.length > 1) {
                              // Confirm before deleting
                              if (confirm(`Are you sure you want to delete the ${role.title} role?`)) {
                                // In a real app, this would make an API call to delete the role
                                console.log("Deleting role:", role.id);
                                
                                // For demonstration, we'll simulate deletion by filtering out the role
                                const updatedRoles = roles.filter(r => r.id !== role.id);
                                queryClient.setQueryData(['/api/roles'], updatedRoles);
                                
                                showToast('Role removed', {
                                  description: `The ${role.title} role has been removed.`,
                                  position: 'top-center',
                                });
                              }
                            }
                          }}
                        >
                          Remove role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {members.filter(m => m.roleId === role.id).length} members
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite members</DialogTitle>
            <DialogDescription>
              Invite a new member to your sales team and assign them a role
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center">
                Email address <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="role" className="text-sm font-medium">
                  Assign role
                </label>
                <Button variant="link" className="h-auto p-0 text-sm text-blue-600">
                  Create new role
                </Button>
              </div>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div>
                        <div className="font-medium">{role.title}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gray-900 hover:bg-gray-800" 
              onClick={handleSendInvitation}
              disabled={!inviteEmail || !selectedRoleId}
            >
              Send invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Role Form Modal */}
      <RoleForm
        open={roleFormOpen}
        onOpenChange={setRoleFormOpen}
        initialData={selectedRole}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}