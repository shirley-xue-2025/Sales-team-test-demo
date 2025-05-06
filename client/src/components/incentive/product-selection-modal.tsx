import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
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
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-semibold">Select products</h2>
              <button 
                onClick={() => onOpenChange(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Choose which products to include in the incentive plan.
              Products removed from the incentive plan will no longer be
              available for new deals.
            </p>
            
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-5">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center">
                    <div className="mr-3">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={localSelectedIds.includes(product.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(product.id, !!checked)}
                        className="border-green-600 text-green-600 focus:ring-green-500"
                      />
                    </div>
                    <label 
                      htmlFor={`product-${product.id}`} 
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      {product.name}
                    </label>
                    <div className="text-sm text-gray-600 font-medium ml-auto">
                      {product.commission} / {product.bonus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between p-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="rounded-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white rounded-sm"
            >
              Save changes
            </Button>
          </div>
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