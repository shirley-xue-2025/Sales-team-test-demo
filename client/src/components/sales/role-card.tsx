import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type Role } from '@shared/schema';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onConfigureIncentive?: (roleId: number) => void;
  onSetAsDefault?: (roleId: number) => void;
  totalRoles: number;
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

const RoleCard = ({ 
  role, 
  onEdit, 
  onDelete, 
  onConfigureIncentive, 
  onSetAsDefault,
  totalRoles 
}: RoleCardProps) => {
  const [, setLocation] = useLocation();
  
  // Navigate to members page with filter when member count is clicked
  const handleMemberCountClick = () => {
    setLocation(`/members?roleId=${role.id}`);
  };
  
  const isDefaultBadge = role.isDefault ? (
    <Badge className="bg-green-50 text-green-700 border-green-200 ml-2 text-xs">
      Default
    </Badge>
  ) : null;

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-sm shadow-sm">
      {/* Header section - fixed height */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <h4 className="text-md font-medium text-gray-900">{role.title}</h4>
            {isDefaultBadge}
          </div>
          <div className="flex space-x-1 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm"
                  aria-label="Role actions"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="6" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="18" r="1" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onEdit(role)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit role
                </DropdownMenuItem>
                
                {onConfigureIncentive && (
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onConfigureIncentive(role.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                    Configure incentive plan
                  </DropdownMenuItem>
                )}
                
                {onSetAsDefault && !role.isDefault && (
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onSetAsDefault(role.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Set as default
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 cursor-pointer"
                  disabled={totalRoles <= 1}
                  onClick={() => totalRoles > 1 && onDelete(role.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Remove role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{role.description}</p>
      </div>
      
      {/* Middle flexible section - will stretch to fill available space */}
      <div className="flex-grow"></div>
      
      {/* Footer section - always at bottom */}
      <div className="mt-auto">
        {/* Permissions area */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
          <h5 className="text-xs font-medium text-gray-500 mb-2">Permissions</h5>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(role.permissions) ? 
              (role.permissions as string[]).map((permission: string) => (
                <PermissionBadge key={permission} permission={permission} />
              )) 
            : null}
          </div>
        </div>
        
        {/* Members count - moved to the bottom */}
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
          <button
            onClick={handleMemberCountClick}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap overflow-hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="truncate">{role.memberCount || 0} members</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
