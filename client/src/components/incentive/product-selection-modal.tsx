import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FiFilter, FiSearch, FiCheck, FiX } from 'react-icons/fi';
import { Product } from '@/lib/types';

interface ProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  selectedProductIds: string[];
  onSelectProducts: (productIds: string[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  open,
  onOpenChange,
  products,
  selectedProductIds,
  onSelectProducts
}) => {
  // Local state for selection
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [deselectedProducts, setDeselectedProducts] = useState<string[]>([]);
  
  const ITEMS_PER_PAGE = 5;
  
  // Initialize local selection from props
  useEffect(() => {
    if (open) {
      setLocalSelectedIds([...selectedProductIds]);
    }
  }, [open, selectedProductIds]);
  
  // Toggle selection for a product
  const toggleProductSelection = (productId: string) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(productId)) {
        // If product was previously selected, track it as deselected
        if (selectedProductIds.includes(productId)) {
          setDeselectedProducts(prev => [...prev, productId]);
        }
        return prev.filter(id => id !== productId);
      } else {
        // If product was previously deselected, remove from deselected list
        setDeselectedProducts(prev => prev.filter(id => id !== productId));
        return [...prev, productId];
      }
    });
  };

  // Handle select button click
  const handleSelectClick = () => {
    // If any products were deselected, show warning dialog
    if (deselectedProducts.length > 0 && !dontAskAgain) {
      setShowWarningDialog(true);
    } else {
      confirmSelection();
    }
  };
  
  // Confirm selection after warning
  const confirmSelection = () => {
    onSelectProducts(localSelectedIds);
    setShowWarningDialog(false);
    onOpenChange(false);
    setDeselectedProducts([]);
  };
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Paginate products
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  // Generate pagination numbers
  const paginationNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationNumbers.push(i);
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Select products</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <FiFilter className="h-4 w-4" />
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Ready to sell</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="p-2">
                    <Checkbox 
                      checked={localSelectedIds.includes(product.id)} 
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                  </TableCell>
                  <TableCell className="py-2">{product.id}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 rounded-sm w-8 h-8 flex items-center justify-center">
                        <span className="text-xs">P</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">Created: {product.created}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {product.id.startsWith('2') ? '10,00€' : (product.id.startsWith('3') ? '25,00€' : '15,00€')}
                  </TableCell>
                  <TableCell className="py-2">
                    {product.id.charAt(0) !== '4' ? (
                      <FiCheck className="text-green-500 w-5 h-5" />
                    ) : (
                      <FiX className="text-gray-400 w-5 h-5" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination controls */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>
            
            {paginationNumbers.map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 ${currentPage === pageNum ? 'bg-gray-100 text-gray-700' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="mr-2">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSelectClick} className="bg-gray-900 hover:bg-gray-800">
              Select({localSelectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Warning dialog for deselecting products */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove products from incentive plan?</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Sales team members will no longer be able to create deals for the removed products. 
              This won't affect existing deals.
            </p>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="dont-ask-again" checked={dontAskAgain} onCheckedChange={() => setDontAskAgain(!dontAskAgain)} />
              <label htmlFor="dont-ask-again" className="text-sm text-gray-600">Don't remind me again</label>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowWarningDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSelection}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductSelectionModal;