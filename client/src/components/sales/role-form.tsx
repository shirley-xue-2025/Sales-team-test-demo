import React from 'react';
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

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "At least one permission must be selected"),
});

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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      permissions: initialData?.permissions || [],
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    form.reset();
  };
  
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
            {isEditMode ? 'Edit plan' : 'Edit plan'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode 
              ? 'Update the details for this role.' 
              : 'Create a new role.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Commission plan name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="The Closer" 
                      className="border-gray-300 rounded-sm" 
                      {...field} 
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the commission plan" 
                      rows={2}
                      className="border-gray-300 rounded-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="border-t border-b py-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 bg-gray-200 rounded-sm flex items-center justify-center text-xs font-medium">
                    4
                  </span>
                  <span className="text-sm text-gray-700">selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 h-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    Deposit commission
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 h-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 h-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 pb-2">
                <div className="col-span-1">
                  <Checkbox className="rounded-sm" />
                </div>
                <div className="col-span-3">ID</div>
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Commission</div>
                <div className="col-span-2">Bonus</div>
              </div>
              
              {/* Permissions displayed as table rows */}
              {availablePermissions.map((permission) => (
                <FormField
                  key={permission.id}
                  control={form.control}
                  name="permissions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={permission.id}
                        className="grid grid-cols-12 gap-2 items-center py-1 text-sm"
                      >
                        <div className="col-span-1">
                          <FormControl>
                            <Checkbox
                              className="rounded-sm"
                              checked={field.value?.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permission.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== permission.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                        </div>
                        <div className="col-span-3 text-gray-800">
                          {permission.id.substring(0, 6)}
                        </div>
                        <div className="col-span-4 flex items-center">
                          <div className="w-6 h-6 bg-gray-100 rounded-sm flex items-center justify-center mr-2">
                            <span className="text-xs">P</span>
                          </div>
                          <span>{permission.label.split(' ')[0]}</span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Input
                              type="text"
                              className="w-12 h-8 rounded-sm border-gray-300 text-center"
                              defaultValue="7.0"
                            />
                            <span className="ml-1">%</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="text"
                            className="w-full h-8 rounded-sm border-gray-300"
                            defaultValue="0"
                          />
                        </div>
                      </FormItem>
                    )
                  }}
                />
              ))}
              
              {form.formState.errors.permissions && (
                <p className="text-sm font-medium text-red-600 mt-1">
                  {form.formState.errors.permissions.message}
                </p>
              )}
            </div>
            
            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-9 px-4 py-2 rounded-sm border-gray-300"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="h-9 px-4 py-2 bg-gray-900 text-white rounded-sm hover:bg-gray-800"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;
