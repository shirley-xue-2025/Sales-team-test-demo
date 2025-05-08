import React, { useState, useEffect } from 'react';
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

// Number of products to display per page
const ITEMS_PER_PAGE = 5;

export default function ProductSelectionModal({
  open,
  onOpenChange,
  products,
  selectedProductIds,
  onSelectProducts
}: ProductSelectionModalProps) {
  // Local state to track selections before committing changes
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  
  // State for warning alert
  const [showWarning, setShowWarning] = useState(false);
  const [productsToRemove, setProductsToRemove] = useState<Product[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtered products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.includes(searchQuery)
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  // Get current page products
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Generate pagination array
  const generatePagination = (): number[] => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Show first, last, and pages around current
    const pages: number[] = [];
    
    if (currentPage <= 5) {
      // Beginning pages case
      for (let i = 1; i <= 7; i++) pages.push(i);
      pages.push(0); // Separator
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 4) {
      // End pages case
      pages.push(1);
      pages.push(0); // Separator
      for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
    } else {
      // Middle case
      pages.push(1);
      pages.push(0); // Separator
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      pages.push(0); // Separator
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Reset local selections when the modal opens
  useEffect(() => {
    if (open) {
      console.log('Product selection modal opened with selected IDs:', selectedProductIds);
      // Create a new array to avoid reference issues
      setLocalSelectedIds([...selectedProductIds]);
      setCurrentPage(1);
      setSearchQuery('');
    }
  }, [open, selectedProductIds]);
  
  // Log for debugging purposes
  useEffect(() => {
    if (open) {
      console.log('Product selection modal products:', products);
      console.log('Modal selected products:', localSelectedIds);
    }
  }, [open, products, localSelectedIds]);

  // Handle checkbox change - Only affects local state, not database
  const handleCheckboxChange = (productId: string, checked: boolean) => {
    console.log(`Checkbox change: ${productId} => ${checked ? 'checked' : 'unchecked'}`);
    
    // Clone the current state to avoid reference issues
    const updatedSelections = [...localSelectedIds];
    
    if (checked) {
      // Add the product if it's not already selected
      if (!updatedSelections.includes(productId)) {
        updatedSelections.push(productId);
      }
    } else {
      // Remove the product if it's currently selected
      const index = updatedSelections.indexOf(productId);
      if (index !== -1) {
        updatedSelections.splice(index, 1);
      }
    }
    
    // Update state with the new selections
    setLocalSelectedIds(updatedSelections);
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
    // Reset to original selections with a new array copy
    setLocalSelectedIds([...selectedProductIds]);
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
    // User cancelled, reset to original selections with a new array copy
    setLocalSelectedIds([...selectedProductIds]);
    setShowWarning(false);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Calculate the selection count
  const selectionCount = localSelectedIds.length;
  
  // Generate page numbers for display
  const paginationItems = generatePagination();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden flex flex-col max-h-[80vh]">
          <DialogTitle className="sr-only">Select Products</DialogTitle>
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold">Select products</h2>
            {/* Removed duplicate close button */}
          </div>
          
          {/* Search and filter area */}
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="h-10 px-3">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    className="pl-9 h-10 w-48" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                  />
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-full bg-gray-100"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </Button>
                {paginationItems.map((page, i) => (
                  page === 0 ? (
                    <span key={`ellipsis-${i}`} className="flex items-center justify-center h-10 w-10">...</span>
                  ) : (
                    <Button 
                      key={`page-${page}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`h-10 w-10 rounded-full ${page === currentPage ? 'bg-gray-200' : 'bg-gray-100'}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-full bg-gray-100"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content scrollable area */}
          <div className="p-6 pt-0 flex-1 overflow-auto">
            {/* Debug info for development */}
            {products.length === 0 && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                <strong>Debug info:</strong> No products available in the props.
              </div>
            )}
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-left sticky top-0">
                  <tr>
                    <th className="p-3 w-12">
                      <Checkbox 
                        id="select-all-checkbox"
                        name="select-all-checkbox"
                        checked={currentProducts.length > 0 && currentProducts.every(p => localSelectedIds.includes(p.id))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Select all products in current view
                            const newSelectedIds = [...localSelectedIds];
                            
                            // Add all products from current page
                            currentProducts.forEach(p => {
                              if (!newSelectedIds.includes(p.id)) {
                                newSelectedIds.push(p.id);
                              }
                            });
                            
                            console.log('Select all checked, new selections:', newSelectedIds);
                            setLocalSelectedIds(newSelectedIds);
                          } else {
                            // Unselect all products in current view
                            const productIdsToRemove = currentProducts.map(p => p.id);
                            const newSelectedIds = localSelectedIds.filter(id => 
                              !productIdsToRemove.includes(id)
                            );
                            
                            console.log('Select all unchecked, new selections:', newSelectedIds);
                            setLocalSelectedIds(newSelectedIds);
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
                  {products.length > 0 && currentProducts.map((product) => {
                    const isSelected = localSelectedIds.includes(product.id);
                    return (
                      <tr 
                        key={product.id} 
                        className={`hover:bg-gray-50 bg-white even:bg-gray-50 ${isSelected ? 'bg-gray-50' : ''}`}
                        onClick={(e) => {
                          // Prevent click handling if the click was on the checkbox itself
                          // This prevents the double-toggling issue when clicking directly on checkbox
                          if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
                            handleCheckboxChange(product.id, !isSelected);
                          }
                        }}
                      >
                        <td className="p-3">
                          <Checkbox
                            id={`product-${product.id}`}
                            name={`product-${product.id}`}
                            checked={isSelected}
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
                              <div className="text-xs text-gray-500">Product ID: {product.id}</div>
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
                    );
                  })}
                  {(currentProducts.length === 0 || products.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        {products.length === 0 
                          ? "No products available. Please add products first."
                          : "No products found matching your search criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Fixed action buttons area - Both buttons together on the right */}
          <div className="flex justify-end items-center p-4 border-t bg-white">
            <div className="space-x-3">
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