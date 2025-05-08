import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Search, Filter } from 'lucide-react';
import { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';

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

  // Calculate the selection count
  const selectionCount = localSelectedIds.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Select Products</DialogTitle>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Select products</h2>
              <button 
                onClick={() => onOpenChange(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input className="pl-9 h-10 w-48" placeholder="Search..." />
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full bg-gray-100">
                  &lt;
                </Button>
                {[1, 3, 4, 5, 6, 7, 8, 9, 10].map((page, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    size="sm" 
                    className={`h-10 w-10 rounded-full ${page === 1 ? 'bg-gray-200' : 'bg-gray-100'}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full bg-gray-100">
                  &gt;
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3 w-12">
                      <Checkbox 
                        checked={products.length > 0 && products.every(p => localSelectedIds.includes(p.id))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLocalSelectedIds(products.map(p => p.id));
                          } else {
                            setLocalSelectedIds([]);
                          }
                        }}
                        className="rounded-sm"
                      />
                    </th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase text-right">Price</th>
                    <th className="p-3 text-xs font-medium text-gray-500 uppercase text-center">Ready to sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 bg-white even:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={localSelectedIds.includes(product.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(product.id, !!checked)}
                          className="rounded-sm"
                        />
                      </td>
                      <td className="p-3 text-sm text-gray-600">{product.id}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                            <span className="text-xs text-gray-500">IMG</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">Learn how to play piano</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-right">{product.price}</td>
                      <td className="p-3 text-center">
                        {product.isSellable ? (
                          <div className="flex justify-center">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <svg className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between p-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-black hover:bg-gray-800 text-white rounded-full px-6"
            >
              Select ({selectionCount})
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