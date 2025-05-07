import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { type Role, type RoleInsert } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

type FormValues = {
  title: string;
  description: string;
  permissions: string[];
};

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "At least one permission must be selected"),
}) satisfies z.ZodType<FormValues>;

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Role;
  onSubmit: (data: RoleInsert) => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit 
}) => {
  const isEditMode = !!initialData;
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      permissions: Array.isArray(initialData?.permissions) 
        ? initialData.permissions as string[] 
        : ['edit', 'view'], // Default permissions
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    form.reset();
  };
  
  const generateDescription = async (roleName: string) => {
    if (!roleName || roleName.length < 2 || isEditMode) return;
    
    try {
      setIsGeneratingDescription(true);
      const response = await apiRequest('POST', '/api/generate-role-description', { roleName });
      const data = await response.json();
      
      if (data.description) {
        form.setValue('description', data.description, { 
          shouldValidate: true,
          shouldDirty: true 
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // When title changes, generate description after a brief delay
  const handleTitleChange = (value: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      generateDescription(value);
    }, 1000); // 1 second delay
    
    setDebounceTimeout(timeout);
  };
  
  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);
  
  const availablePermissions = [
    { id: 'admin', label: 'Administrator (Full access)' },
    { id: 'edit', label: 'Edit (Can modify but not delete)' },
    { id: 'view', label: 'View (Read-only access)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Create New Role
          </DialogTitle>
          <DialogDescription className="text-base font-normal text-gray-500 mt-1">
            Create a new role for your sales team members
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-800">
                    Role Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Sales Representative" 
                      className="border-gray-300 rounded-sm mt-2 text-base py-5 px-4" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleTitleChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-medium text-gray-800">
                      Description
                    </FormLabel>
                    {isGeneratingDescription && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Generating description...
                      </div>
                    )}
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder={isGeneratingDescription ? "Generating description..." : "Describe the role's responsibilities"} 
                      rows={4}
                      className="border-gray-300 rounded-sm mt-2 text-base py-3 px-4" 
                      {...field} 
                      disabled={isGeneratingDescription}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Hidden permissions field to satisfy validation */}
            <div className="hidden">
              {availablePermissions.map((permission) => (
                <FormField
                  key={permission.id}
                  control={form.control}
                  name="permissions"
                  render={({ field }) => {
                    // Auto-select all permissions by default
                    if (!field.value.includes(permission.id)) {
                      field.onChange([...field.value, permission.id]);
                    }
                    return (
                      <FormItem className="hidden">
                        <FormControl>
                          <Checkbox
                            checked={true}
                            onChange={() => {}}
                          />
                        </FormControl>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            
            <DialogFooter className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-10 px-5 py-2 rounded-sm border-gray-300 font-medium"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="h-10 px-5 py-2 bg-gray-900 text-white rounded-sm hover:bg-gray-800 font-medium"
              >
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;
