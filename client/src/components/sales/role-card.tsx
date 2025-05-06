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
  let className = '';
  
  if (permission === 'admin') {
    className = 'bg-red-100 text-red-800';
  } else if (permission === 'edit') {
    className = 'bg-green-100 text-green-800';
  } else if (permission === 'view') {
    className = 'bg-blue-100 text-blue-800';
  }
  
  return (
    <Badge variant="outline" className={`px-2 py-1 text-xs font-medium rounded-sm ${className}`}>
      {permission}
    </Badge>
  );
};

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden border border-gray-200 rounded-sm shadow-sm">
      <CardContent className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-medium text-gray-900">{role.title}</h4>
          <div className="flex space-x-1">
            <button 
              onClick={() => onEdit(role)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-sm"
              aria-label="Edit role"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              onClick={() => onDelete(role.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-sm"
              aria-label="Delete role"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{role.description}</p>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-gray-50">
        <div className="w-full">
          <h5 className="text-xs font-medium text-gray-500 mb-2">Permissions</h5>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(role.permissions) ? role.permissions.map((permission: string) => (
              <PermissionBadge key={permission} permission={permission} />
            )) : null}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoleCard;
