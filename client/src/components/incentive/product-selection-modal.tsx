import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/lib/types';

interface ProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  selectedProductIds: string[];
  onSelectProducts: (productIds: string[]) => void;
}

export default function ProductSelectionModal({
  open,
  onOpenChange,
  products,
  selectedProductIds,
  onSelectProducts
}: ProductSelectionModalProps) {
  // Local state to track selections before committing changes
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedProductIds);
  
  // State for warning alert
  const [showWarning, setShowWarning] = useState(false);
  const [productsToRemove, setProductsToRemove] = useState<Product[]>([]);
  
  // Reset local selections when the modal opens
  React.useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedProductIds);
    }
  }, [open, selectedProductIds]);

  // Handle checkbox change
  const handleCheckboxChange = (productId: string, checked: boolean) => {
    if (checked) {
      setLocalSelectedIds(prev => [...prev, productId]);
    } else {
      // If deselecting a product that was previously selected, show warning
      if (selectedProductIds.includes(productId)) {
        const productToRemove = products.find(p => p.id === productId);
        if (productToRemove) {
          setProductsToRemove([productToRemove]);
          setShowWarning(true);
        }
      }
      setLocalSelectedIds(prev => prev.filter(id => id !== productId));
    }
  };

  // Handle save button click
  const handleSave = () => {
    // Check if any products are being removed
    const productsBeingRemoved = selectedProductIds.filter(id => !localSelectedIds.includes(id))
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as Product[];
    
    if (productsBeingRemoved.length > 0) {
      setProductsToRemove(productsBeingRemoved);
      setShowWarning(true);
    } else {
      // No removals, commit changes directly
      onSelectProducts(localSelectedIds);
      onOpenChange(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    // Reset to original selections
    setLocalSelectedIds(selectedProductIds);
    onOpenChange(false);
  };

  // Handle confirm removal in warning dialog
  const handleConfirmRemoval = () => {
    // User confirmed, proceed with changes
    onSelectProducts(localSelectedIds);
    setShowWarning(false);
    onOpenChange(false);
  };

  // Handle cancel removal in warning dialog
  const handleCancelRemoval = () => {
    // User cancelled, reset to original selections
    setLocalSelectedIds(selectedProductIds);
    setShowWarning(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select products</DialogTitle>
            <DialogDescription>
              Choose which products to include in the incentive plan. Products removed from the incentive plan will no longer be available for new deals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto py-4">
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 px-1 py-1 hover:bg-gray-50 rounded-sm">
                  <Checkbox 
                    id={`product-${product.id}`}
                    checked={localSelectedIds.includes(product.id)} 
                    onCheckedChange={(checked) => handleCheckboxChange(product.id, !!checked)}
                  />
                  <label htmlFor={`product-${product.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                    {product.name}
                  </label>
                  <div className="text-sm text-gray-500">
                    {product.commission} / {product.bonus}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Alert Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove products from incentive plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {productsToRemove.length === 1 ? (
                <>
                  <span className="font-medium">{productsToRemove[0].name}</span> will be removed from the incentive plan. 
                  Sales team members won't be able to create new deals for this product.
                </>
              ) : (
                <>
                  <span className="font-medium">{productsToRemove.length} products</span> will be removed from the incentive plan. 
                  Sales team members won't be able to create new deals for these products.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRemoval}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRemoval}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}