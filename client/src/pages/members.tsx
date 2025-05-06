import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/lib/types';
import { Settings, MoreVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Member {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Fetch roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mock members data
  const members: Member[] = [
    { id: 1411, name: 'Muhammad Gunes', email: 'muhammad.gunes@example.com', roleId: 1 },
    { id: 1410, name: 'Abdullah Khalid Cuadrado', email: 'abdullah.khalid@example.com', roleId: 2 },
    { id: 416, name: 'Fernando Ferreira', email: 'fernando.ferreira@example.com', roleId: 3 },
  ];

  // Mock pending invitations
  const invitations = [
    { email: 'john.doe@example.com', roleId: 1, sentAt: '2023-05-01T10:00:00Z' },
    { email: 'jane.smith@example.com', roleId: 2, sentAt: '2023-05-02T14:30:00Z' },
  ];

  const handleSendInvitation = () => {
    // In a real app, this would send an API request
    console.log('Sending invitation to:', inviteEmail, 'with role:', selectedRoleId);
    
    // Close modal and reset form
    setInviteModalOpen(false);
    setInviteEmail('');
    setSelectedRoleId('');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Members (MEB)</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setInviteModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Invite members
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-red-500 mr-2">⚠</div>
          <span className="text-sm">You've reached your current member limit. Upgrade your plan now and let your team continue to grow.</span>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="default" className="h-8 bg-green-600 hover:bg-green-700">
            Upgrade
          </Button>
          <Button size="sm" variant="ghost" className="h-8">
            Hide
          </Button>
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
                      <Select defaultValue={member.roleId.toString()} onValueChange={(value) => {
                        console.log(`Changing ${member.name}'s role to ${value}`);
                        // In a real app, this would update the member's role via API
                      }}>
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
                      <Select defaultValue={invitation.roleId.toString()} onValueChange={(value) => {
                        console.log(`Changing ${invitation.email}'s role to ${value}`);
                        // In a real app, this would update the invitation's role via API
                      }}>
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
        <TabsContent value="roles" className="border rounded-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-gray-500">
                <th className="px-4 py-3">ROLE</th>
                <th className="px-4 py-3">DESCRIPTION</th>
                <th className="px-4 py-3">MEMBERS</th>
                <th className="px-4 py-3 text-right w-32">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{role.title}</td>
                  <td className="px-4 py-3 text-sm">{role.description}</td>
                  <td className="px-4 py-3 text-sm">
                    {members.filter(m => m.roleId === role.id).length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}