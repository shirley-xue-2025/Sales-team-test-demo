import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { type Role } from '@shared/schema';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

const PermissionBadge = ({ permission }: { permission: string }) => {
  let className = 'bg-blue-100 text-blue-800';
  
  if (permission === 'admin') {
    className = 'bg-primary-100 text-primary-800';
  } else if (permission === 'edit') {
    className = 'bg-green-100 text-green-800';
  }
  
  return (
    <Badge variant="outline" className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
      {permission}
    </Badge>
  );
};

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h4 className="text-md font-medium text-gray-900">{role.title}</h4>
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(role)}
              className="text-gray-500 hover:text-primary-500"
              aria-label="Edit role"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              onClick={() => onDelete(role.id)}
              className="text-gray-500 hover:text-destructive"
              aria-label="Delete role"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{role.description}</p>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-gray-50">
        <div className="w-full">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Permissions</h5>
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((permission) => (
              <PermissionBadge key={permission} permission={permission} />
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoleCard;
