import React, { useState } from 'react';
import { useIncentiveStore } from '@/lib/incentiveStore';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, 
} from '@/components/ui/dropdown-menu';
import { UserIcon, UserCheck, LogOut, User } from 'lucide-react';

export function AccountSwitcher() {
  const { 
    members, 
    userMode, 
    switchToMember, 
    currentMemberId,
    roles,
    getCurrentMember
  } = useIncentiveStore();
  
  const [open, setOpen] = useState(false);
  
  const currentMember = getCurrentMember();
  const currentRole = currentMember 
    ? roles.find(r => r.id === currentMember.roleId) 
    : null;
  
  // Get current user name and role text
  const getCurrentUserText = () => {
    if (userMode === 'seller') {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">Sales Team Admin</span>
          <span className="text-xs text-muted-foreground">Admin Account</span>
        </div>
      );
    } else if (currentMember && currentRole) {
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentMember.name}</span>
          <span className="text-xs text-muted-foreground">{currentRole.title}</span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium">Unknown User</span>
        <span className="text-xs text-muted-foreground">No Account Selected</span>
      </div>
    );
  };
  
  // Get the avatar for the current user
  const getAvatar = () => {
    if (userMode === 'seller') {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <UserCheck className="h-4 w-4 text-primary" />
        </div>
      );
    } else if (currentMember) {
      if (currentMember.avatarUrl) {
        return (
          <img 
            src={currentMember.avatarUrl} 
            alt={currentMember.name} 
            className="h-8 w-8 rounded-full" 
          />
        );
      } else {
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
        );
      }
    }
    
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <UserIcon className="h-4 w-4 text-primary" />
      </div>
    );
  };
  
  const handleSwitchAccount = (memberId: number | null) => {
    switchToMember(memberId);
    setOpen(false);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-2 rounded-md hover:bg-accent w-full">
          {getAvatar()}
          {getCurrentUserText()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem 
          className={`flex items-center gap-2 ${userMode === 'seller' ? 'bg-accent' : ''}`}
          onClick={() => handleSwitchAccount(null)}
        >
          <UserCheck className="h-4 w-4" />
          <span>Sales Team Admin</span>
        </DropdownMenuItem>
        
        <div className="px-2 py-1.5 text-xs font-semibold">Sales Team Members</div>
        
        {members.map(member => {
          const memberRole = roles.find(r => r.id === member.roleId);
          const isActive = currentMemberId === member.id;
          
          return (
            <DropdownMenuItem 
              key={member.id}
              className={`flex items-center gap-2 ${isActive ? 'bg-accent' : ''}`}
              onClick={() => handleSwitchAccount(member.id)}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="h-7 w-7 rounded-full" />
                ) : (
                  <User className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{member.name}</span>
                <span className="text-xs text-muted-foreground">{memberRole?.title || 'No Role'}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}