import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Invitation {
  id: string;
  invitedBy: string;
  email: string;
  teamName: string;
  invitedOn: string;
  status: 'Active' | 'Pending' | 'Expired';
}

export default function SalesMemberInvitations() {
  // Mock data for invitations
  const invitations: Invitation[] = [
    {
      id: '1849',
      invitedBy: 'myeasybusiness',
      email: 'buchhaltung@myeasybusiness.de',
      teamName: 'MEB',
      invitedOn: '07.04.2025 22:14',
      status: 'Active'
    }
  ];

  // Status badge styling
  const getStatusBadge = (status: Invitation['status']) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'Expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invitations</h1>
        <Button variant="outline" className="border-gray-300 text-sm text-gray-700 font-medium">
          Sales Team Member Account
        </Button>
      </div>

      {/* Invitations Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invited By
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-Mail
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invited On
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <tr key={invitation.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invitation.id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invitation.invitedBy}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invitation.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invitation.teamName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invitation.invitedOn}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(invitation.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}