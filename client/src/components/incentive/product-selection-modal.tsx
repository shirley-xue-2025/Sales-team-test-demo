import React, { useState, useEffect, useCallback } from 'react';
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

// Product row component extracted to ensure proper re-renders
const ProductRow = React.memo(({ 
  product, 
  isSelected, 
  onToggle 
}: { 
  product: Product; 
  isSelected: boolean; 
  onToggle: (productId: string, selected: boolean) => void;
}) => {
  // Removed excessive logging

  const handleRowClick = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    // Prevent click handling if the click was on or inside the checkbox itself
    const target = e.target as HTMLElement;
    const isCheckboxOrChild = 
      target.tagName.toLowerCase() === 'button' || 
      target.closest('[role="checkbox"]') !== null ||
      target.tagName.toLowerCase() === 'svg' || 
      target.tagName.toLowerCase() === 'path';
      
    if (!isCheckboxOrChild) {
      // Toggle the selection directly through the parent handler
      onToggle(product.id, !isSelected);
    }
  }, [product.id, isSelected, onToggle]);

  const handleCheckboxChange = useCallback((checked: boolean | 'indeterminate') => {
    // Simple direct conversion from checkbox state to boolean
    const finalChecked = checked === 'indeterminate' ? false : !!checked;
    
    // If isSelected is true and we're toggling, pass false
    // If isSelected is false and we're toggling, pass true
    // this ensures we always toggle the actual state
    onToggle(product.id, finalChecked);
  }, [product.id, onToggle]);

  return (
    <tr 
      key={product.id} 
      className={`hover:bg-gray-50 bg-white even:bg-gray-50 ${isSelected ? 'bg-gray-50' : ''}`}
      onClick={handleRowClick}
    >
      <td className="p-3">
        <Checkbox
          id={`product-${product.id}`}
          name={`product-${product.id}`}
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
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
});

export default function ProductSelectionModal({
  open,
  onOpenChange,
  products,
  selectedProductIds,
  onSelectProducts
}: ProductSelectionModalProps) {
  // Create state with key counter to force remounts when needed
  const [localStateKey, setLocalStateKey] = useState(0);
  
  // Local state to track selections before committing changes
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  
  // State for warning alert
  const [showWarning, setShowWarning] = useState(false);
  const [productsToRemove, setProductsToRemove] = useState<Product[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reset local selections when the modal opens
  useEffect(() => {
    if (open) {
      console.log('[ProductSelectionModal] Modal opened, resetting state with selectedProductIds:', selectedProductIds);
      console.log('[ProductSelectionModal] Products received:', products);
      console.log('[ProductSelectionModal] Products count:', products.length);
      
      // Create a new array to avoid reference issues and increment the key to force remounting
      setLocalSelectedIds([...selectedProductIds]);
      setLocalStateKey(prev => prev + 1);
      setCurrentPage(1);
      setSearchQuery('');
    }
  }, [open, selectedProductIds, products]);
  
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
  
  // Debug logging for current products
  console.log('[ProductSelectionModal] Filtered products:', filteredProducts.length);
  console.log('[ProductSelectionModal] Current page products:', currentProducts.length);
  
  // Generate pagination array
  const generatePagination = useCallback((): number[] => {
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
  }, [currentPage, totalPages]);

  // Handle checkbox change - Only affects local state, not database
  const handleProductToggle = useCallback((productId: string, checked: boolean) => {
    // Simplified toggle logic - create brand new array each time to ensure state updates
    setLocalSelectedIds(prevSelections => {
      // Get current selection state
      const isCurrentlySelected = prevSelections.includes(productId);
      
      // If value is already in the desired state, don't change
      if ((isCurrentlySelected && checked) || (!isCurrentlySelected && !checked)) {
        // Make a copy to ensure reference changes for React
        return [...prevSelections]; 
      }
      
      // Create a brand new array to ensure React detects the state change
      if (checked) {
        // Add the ID (selection)
        return [...prevSelections, productId];
      } else {
        // Remove the ID (deselection)
        return prevSelections.filter(id => id !== productId);
      }
    });
    
    // Force an update to localStateKey to ensure child components re-render
    setLocalStateKey(prev => prev + 1);
  }, []);

  // Handle select/deselect all on current page
  const handleSelectAllChange = useCallback((checked: boolean | 'indeterminate') => {
    console.log(`[ProductSelectionModal] Select all changed to ${checked}`);
    const isChecked = checked === true; // Only true if explicitly set to true
    
    setLocalSelectedIds(prevSelections => {
      // Make a copy to avoid mutations
      const newSelections = [...prevSelections];
      
      if (isChecked) {
        // Add all products from current page that aren't already selected
        currentProducts.forEach(product => {
          if (!newSelections.includes(product.id)) {
            newSelections.push(product.id);
          }
        });
      } else {
        // Remove all products from current page
        return newSelections.filter(id => 
          !currentProducts.some(product => product.id === id)
        );
      }
      
      return newSelections;
    });
  }, [currentProducts]);

  // Handle save button click
  const handleSave = useCallback(() => {
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
  }, [localSelectedIds, selectedProductIds, products, onSelectProducts, onOpenChange]);

  // Handle cancel button
  const handleCancel = useCallback(() => {
    // Reset to original selections with a new array copy
    setLocalSelectedIds([...selectedProductIds]);
    onOpenChange(false);
  }, [selectedProductIds, onOpenChange]);

  // Handle confirm removal in warning dialog
  const handleConfirmRemoval = useCallback(() => {
    // User confirmed, proceed with changes
    onSelectProducts(localSelectedIds);
    setShowWarning(false);
    onOpenChange(false);
  }, [localSelectedIds, onSelectProducts, onOpenChange]);

  // Handle cancel removal in warning dialog
  const handleCancelRemoval = useCallback(() => {
    // User cancelled, reset to original selections with a new array copy
    setLocalSelectedIds([...selectedProductIds]);
    setShowWarning(false);
  }, [selectedProductIds]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);

  // Calculate the selection count
  const selectionCount = localSelectedIds.length;
  
  // Generate page numbers for display
  const paginationItems = generatePagination();
  
  // All products on current page are selected
  const allCurrentSelected = currentProducts.length > 0 && 
    currentProducts.every(p => localSelectedIds.includes(p.id));

  // Only log on dev builds and not on every render
  if (process.env.NODE_ENV !== 'production' && localSelectedIds.length > 0) {
    // We only want to log this when debugging specific issues, not on every render
    // console.log(`[ProductSelectionModal] Current selection:`, localSelectedIds.length);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden flex flex-col max-h-[80vh]">
          <DialogTitle className="sr-only">Select Products</DialogTitle>
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold">Select products</h2>
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
            <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <strong>Debug info:</strong> {products.length === 0 ? 
                "No products available in the props." : 
                `Found ${products.length} products in the props.`
              }
              <br/>
              <strong>Products:</strong> {products.map(p => p.id).join(', ')}
            </div>
            
            {/* State debug display */}
            <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded-md">
              <strong>Selected count:</strong> {localSelectedIds.length}
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-left sticky top-0">
                  <tr>
                    <th className="p-3 w-12">
                      <Checkbox 
                        id="select-all-checkbox"
                        name="select-all-checkbox"
                        checked={allCurrentSelected}
                        onCheckedChange={handleSelectAllChange}
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
                  {/* Render products with a key prefix to ensure re-renders */}
                  {products.length > 0 && currentProducts.map((product) => {
                    // Explicitly check if this product ID is in selected IDs
                    const isSelected = localSelectedIds.includes(product.id);
                    
                    console.log('Rendering product row:', product.id, product.name);
                    
                    // Render individual product row with memoization for performance
                    return (
                      <ProductRow
                        key={`product-row-${product.id}`}
                        product={product}
                        isSelected={isSelected}
                        onToggle={handleProductToggle}
                      />
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