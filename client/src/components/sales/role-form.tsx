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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update the details for this sales team role.' 
              : 'Create a new role for your sales team.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sales Manager" {...field} />
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
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the responsibilities of this role" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block mb-2">
                Permissions <span className="text-destructive">*</span>
              </FormLabel>
              {availablePermissions.map((permission) => (
                <FormField
                  key={permission.id}
                  control={form.control}
                  name="permissions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={permission.id}
                        className="flex flex-row items-start space-x-3 space-y-0 py-1"
                      >
                        <FormControl>
                          <Checkbox
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
                        <FormLabel className="font-normal">
                          {permission.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              {form.formState.errors.permissions && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {form.formState.errors.permissions.message}
                </p>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Role</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;
