import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface AccountSwitcherProps {
  className?: string;
}

export function AccountSwitcher({ className = '' }: AccountSwitcherProps) {
  const [location, setLocation] = useLocation();
  
  // Check if we're in the sales member section
  const isSalesMember = location.startsWith('/sales-member');
  
  const handleSwitchAccount = () => {
    if (isSalesMember) {
      // If currently in sales member view, go to admin view
      setLocation('/');
    } else {
      // If currently in admin view, go to sales member view
      setLocation('/sales-member/overview');
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Button 
        onClick={handleSwitchAccount}
        variant="outline" 
        className="bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 text-sm px-3 py-2 h-auto"
      >
        {isSalesMember ? 'Switch to Admin Account' : 'Sales Team Member Account'}
      </Button>
    </div>
  );
}