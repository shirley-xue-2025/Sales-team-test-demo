import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { type Role } from '@shared/schema';
import { useLocation } from 'wouter';

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

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  onEdit, 
  onDelete, 
  onConfigureIncentive, 
  onSetAsDefault,
  totalRoles 
}) => {
  // Use a static variable instead of state to track which dropdown is open
  const [, setLocation] = useLocation();
  // Unique ID for this role card instance
  const [uniqueId] = React.useState(() => `role-card-${role.id}-${Math.random().toString(36).substring(2, 9)}`);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // The dropdown state is now managed by a static variable reference to avoid state conflicts
  const isDropdownOpen = () => window.__openDropdownId === uniqueId;
  const setDropdownOpen = (open: boolean) => {
    if (open) {
      window.__openDropdownId = uniqueId;
    } else if (window.__openDropdownId === uniqueId) {
      window.__openDropdownId = null;
    }
    // Force re-render
    setForceUpdate(prev => prev + 1);
  };
  
  // Force re-render when dropdown state changes
  const [forceUpdate, setForceUpdate] = React.useState(0);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <Card className="overflow-hidden border border-gray-200 rounded-sm shadow-sm">
      <CardContent className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h4 className="text-md font-medium text-gray-900">{role.title}</h4>
            {isDefaultBadge}
          </div>
          <div className="flex space-x-1 relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen())}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-sm"
              aria-label="Role actions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="6" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="18" r="1" />
              </svg>
            </button>
            {isDropdownOpen() && (
              <div className="absolute right-0 top-8 mt-1 z-10 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200 w-48">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      onEdit(role);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit role
                  </button>
                  {onConfigureIncentive && (
                    <button 
                      onClick={() => {
                        onConfigureIncentive(role.id);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20V10" />
                        <path d="M18 20V4" />
                        <path d="M6 20v-6" />
                      </svg>
                      Configure incentive plan
                    </button>
                  )}
                  {onSetAsDefault && !role.isDefault && (
                    <button 
                      onClick={() => {
                        onSetAsDefault(role.id);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Set as default
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      onDelete(role.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${totalRoles <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={totalRoles <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Remove role
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{role.description}</p>

        {/* Member count button */}
        <button
          onClick={handleMemberCountClick}
          className="mt-4 text-xs text-gray-500 hover:text-gray-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {role.memberCount || 0} members
        </button>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-gray-50">
        <div className="w-full">
          <h5 className="text-xs font-medium text-gray-500 mb-2">Permissions</h5>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(role.permissions) ? 
              (role.permissions as string[]).map((permission: string) => (
                <PermissionBadge key={permission} permission={permission} />
              )) 
            : null}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoleCard;
