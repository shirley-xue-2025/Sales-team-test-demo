import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Role } from '@shared/schema';

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onConfirm: () => void;
}

const DeleteRoleDialog: React.FC<DeleteRoleDialogProps> = ({
  open,
  onOpenChange,
  role,
  onConfirm,
}) => {
  if (!role) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[500px] rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-medium">
            Remove {role.title} Role
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 mt-2">
            Are you sure you want to remove this role? This action will permanently 
            delete the role from your organization.
            {role.memberCount && role.memberCount > 0 ? (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                <div className="flex gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <strong>Warning:</strong>
                </div>
                <p className="mt-1">
                  This role has {role.memberCount} member{role.memberCount !== 1 ? 's' : ''} assigned to it.
                  You'll need to reassign these members to other roles after deleting this one.
                </p>
              </div>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-2">
          <AlertDialogCancel className="h-10 px-5 py-2 rounded-sm border-gray-300 font-medium bg-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="h-10 px-5 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 font-medium"
          >
            Remove Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRoleDialog;