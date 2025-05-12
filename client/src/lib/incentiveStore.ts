import { create } from 'zustand';
import { Product, Role, RoleIncentive, CombinedIncentive } from './types';
import { apiRequest } from './queryClient';

// Type for user mode/context
export type UserMode = 'seller' | 'sales';

interface IncentiveStore {
  // Data
  products: Product[];
  roles: Role[];
  roleIncentives: RoleIncentive[];
  mode: 'view' | 'edit';
  selectedRoles: number[];
  userMode: UserMode; // New field to track if user is seller or sales member
  currentSalesRoleId: number | null; // When in sales mode, this tracks the current role
  
  // Loading states
  isLoadingProducts: boolean;
  isUpdatingProducts: boolean;
  
  // UI State
  activeTab: string;
  
  // Actions
  setActiveTab: (tab: string) => void;
  setMode: (mode: 'view' | 'edit') => void;
  toggleProductSelection: (productId: string, roleId: number, selected: boolean) => void;
  toggleRoleSelection: (roleId: number) => void;
  addRole: (role: Role) => void;
  removeRole: (roleId: number) => void;
  setRoles: (roles: Role[]) => void;
  setUserMode: (mode: UserMode) => void;
  setCurrentSalesRole: (roleId: number | null) => void;
  
  // Data fetching
  fetchProducts: () => Promise<void>;
  fetchRoleProducts: (roleId: number) => Promise<Product[]>;
  updateRoleProducts: (roleId: number, productIds: string[]) => Promise<Product[]>;
  
  // Selectors
  getSelectedProductsForRole: (roleId: number) => Product[];
  getAllProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getAvailableProductsForSalesMember: () => Product[];
  calculateCombinedIncentives: () => CombinedIncentive[];
}

export const useIncentiveStore = create<IncentiveStore>((set, get) => ({
  // Data
  products: [],
  roles: [],
  roleIncentives: [],
  mode: 'view',
  selectedRoles: [],
  userMode: 'seller', // Default mode is seller
  currentSalesRoleId: null,
  
  // Loading states
  isLoadingProducts: false,
  isUpdatingProducts: false,
  
  // UI State
  activeTab: 'default',
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setMode: (mode) => set({ mode }),
  
  toggleProductSelection: async (productId, roleId, selected) => {
    // First update the local state for immediate feedback
    const { roleIncentives, products } = get();
    let updatedIncentives = [...roleIncentives];
    
    const existingIndex = updatedIncentives.findIndex(ri => ri.roleId === roleId);
    
    if (existingIndex >= 0) {
      const existing = updatedIncentives[existingIndex];
      if (selected) {
        // Add to selected products if not already there
        if (!existing.productIds.includes(productId)) {
          updatedIncentives[existingIndex] = {
            ...existing,
            productIds: [...existing.productIds, productId]
          };
        }
      } else {
        // Remove from selected products
        updatedIncentives[existingIndex] = {
          ...existing,
          productIds: existing.productIds.filter(id => id !== productId)
        };
      }
    } else if (selected) {
      // Create new role incentive entry
      updatedIncentives.push({
        roleId,
        productIds: [productId]
      });
    }
    
    // Update local state first for immediate feedback
    set({ roleIncentives: updatedIncentives });
    
    // Then update the database
    try {
      set({ isUpdatingProducts: true });
      
      // Get all product IDs for this role after our local state update
      const roleIncentive = updatedIncentives.find(ri => ri.roleId === roleId);
      const productIds = roleIncentive ? roleIncentive.productIds : [];
      
      // Saving product selection to backend
      
      // Send the update to the backend
      await apiRequest('PUT', `/api/roles/${roleId}/products`, { productIds });
      
      // Update the selected status of the product in the products array
      const updatedProducts = products.map(p => 
        p.id === productId 
          ? { ...p, selected } 
          : p
      );
      
      set({ products: updatedProducts });
      
      // Refresh products for this role to ensure consistency
      await get().fetchRoleProducts(roleId);
      
      // Product selection saved successfully
    } catch (error) {
      console.error('Error updating product selection:', error);
      // Revert local changes on error
      await get().fetchRoleProducts(roleId);
    } finally {
      set({ isUpdatingProducts: false });
    }
  },
  
  toggleRoleSelection: (roleId) => {
    const { selectedRoles } = get();
    const isSelected = selectedRoles.includes(roleId);
    
    if (isSelected) {
      set({ selectedRoles: selectedRoles.filter(id => id !== roleId) });
    } else {
      set({ selectedRoles: [...selectedRoles, roleId] });
    }
  },
  
  addRole: (role) => {
    const { roles } = get();
    set({ roles: [...roles, role] });
  },
  
  removeRole: (roleId) => {
    const { roles, roleIncentives } = get();
    set({ 
      roles: roles.filter(role => role.id !== roleId),
      roleIncentives: roleIncentives.filter(ri => ri.roleId !== roleId)
    });
  },
  
  setRoles: (roles) => set({ roles }),
  
  setUserMode: (userMode) => set({ userMode }),
  
  setCurrentSalesRole: (roleId) => set({ currentSalesRoleId: roleId }),

  // Data fetching
  fetchProducts: async () => {
    try {
      set({ isLoadingProducts: true });
      
      // Fetching products from API with updated apiRequest format
      const response = await apiRequest('GET', '/api/products');
      const products = await response.json() as Product[];
      
      if (!products || products.length === 0) {
        console.warn('No products returned from API');
        set({ isLoadingProducts: false });
        return;
      }
      
      // Set products in the store
      set({ products });
      
      // Initialize roleIncentives based on product selected status
      const roleIncentives: RoleIncentive[] = [];
      
      // Group products by their role assignments
      const roleMap: Record<number, string[]> = {};
      
      // Get all roles
      const { roles } = get();
      
      if (!roles || roles.length === 0) {
        console.warn('No roles in the store, skipping role products fetch');
        set({ isLoadingProducts: false });
        return;
      }
      
      // Fetch products for each role
      for (const role of roles) {
        try {
          const response = await apiRequest('GET', `/api/roles/${role.id}/products`);
          const roleProducts = await response.json() as Product[];
          
          if (roleProducts && roleProducts.length > 0) {
            roleMap[role.id] = roleProducts.map((p: Product) => p.id);
          } else {
            // If no products for this role, assign all products by default
            roleMap[role.id] = products.map(p => p.id);
          }
        } catch (error) {
          console.error(`Error fetching products for role ${role.id}:`, error);
          // On error, assign all products to the role
          roleMap[role.id] = products.map(p => p.id);
        }
      }
      
      // Create role incentives array from the role map
      for (const [roleId, productIds] of Object.entries(roleMap)) {
        roleIncentives.push({
          roleId: parseInt(roleId),
          productIds
        });
      }
      set({ roleIncentives });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      set({ isLoadingProducts: false });
    }
  },
  
  fetchRoleProducts: async (roleId) => {
    try {
      const response = await apiRequest('GET', `/api/roles/${roleId}/products`);
      const roleProducts = await response.json() as Product[];
      
      // Processing products for this role
      
      if (!roleProducts || roleProducts.length === 0) {
        console.warn(`No products returned for role ${roleId}`);
        return [];
      }
      
      // Extract product IDs for this role
      const roleProductIds = roleProducts.map((p: Product) => p.id);
      
      // Update roleIncentives
      const { roleIncentives, products, selectedRoles } = get();
      let updatedIncentives = [...roleIncentives];
      
      const existingIndex = updatedIncentives.findIndex(ri => ri.roleId === roleId);
      
      if (existingIndex >= 0) {
        updatedIncentives[existingIndex] = {
          ...updatedIncentives[existingIndex],
          productIds: [...roleProductIds] // Make a copy to avoid reference issues
        };
      } else if (roleProductIds.length > 0) {
        updatedIncentives.push({
          roleId,
          productIds: [...roleProductIds] // Make a copy to avoid reference issues
        });
      }
      
      set({ roleIncentives: updatedIncentives });
      // Updated role incentives for this role
      
      // Update product selection status in the products array if this is a selected role
      if (selectedRoles.includes(roleId) || get().currentSalesRoleId === roleId) {
        // Mark products as selected/unselected based on whether they're in this role's product list
        const updatedProducts = products.map(product => {
          const isSelected = roleProductIds.includes(product.id);
          return { ...product, selected: isSelected };
        });
        
        set({ products: updatedProducts });
      }
      
      return roleProducts;
    } catch (error) {
      console.error(`Error fetching products for role ${roleId}:`, error);
      return [];
    }
  },
  
  updateRoleProducts: async (roleId, productIds) => {
    try {
      set({ isUpdatingProducts: true });
      // Send update to backend - ensure this completes successfully
      const response = await apiRequest('PUT', `/api/roles/${roleId}/products`, { productIds });
      const updatedProducts = await response.json() as Product[];
      
      if (!updatedProducts || updatedProducts.length === 0) {
        throw new Error(`Failed to update products for role ${roleId}`);
      }
      
      // Backend returned updated products for this role
      
      // Update local state with the new product IDs for this role
      const roleIncentives = get().roleIncentives;
      const updatedIncentives = [...roleIncentives];
      const existingIndex = updatedIncentives.findIndex(ri => ri.roleId === roleId);
      
      if (existingIndex >= 0) {
        updatedIncentives[existingIndex] = {
          ...updatedIncentives[existingIndex],
          productIds: [...productIds] // Make a copy to avoid reference issues
        };
      } else if (productIds.length > 0) {
        updatedIncentives.push({
          roleId,
          productIds: [...productIds] // Make a copy to avoid reference issues
        });
      }
      
      set({ roleIncentives: updatedIncentives });
      // Updated role incentives in local state
      
      // Mark products as selected/unselected in the products array
      const allProducts = get().products;
      const updatedProducts2 = allProducts.map(product => {
        const isSelected = productIds.includes(product.id);
        return { ...product, selected: isSelected };
      });
      
      set({ products: updatedProducts2 });
      
      // Refresh products for this role from the server to ensure consistency
      await get().fetchRoleProducts(roleId);
      
      set({ isUpdatingProducts: false });
      return updatedProducts;
    } catch (error) {
      console.error(`Error updating products for role ${roleId}:`, error);
      set({ isUpdatingProducts: false });
      
      // Re-fetch products from server to ensure consistency after an error
      try {
        await get().fetchProducts();
      } catch (fetchError) {
        console.error('Failed to refresh products after error:', fetchError);
      }
      
      throw error;
    }
  },

  // Selectors
  getSelectedProductsForRole: (roleId) => {
    const { products, roleIncentives } = get();
    const roleIncentive = roleIncentives.find(ri => ri.roleId === roleId);
    
    if (!roleIncentive) {
      // If no specific incentives defined for this role, return default selected products
      return products.filter(p => p.selected);
    }
    
    return products.filter(p => roleIncentive.productIds.includes(p.id));
  },
  
  getAllProducts: () => {
    const { products, userMode, currentSalesRoleId } = get();
    
    // If in sales member mode, only return products available to the current role
    if (userMode === 'sales' && currentSalesRoleId !== null) {
      return get().getAvailableProductsForSalesMember();
    }
    
    return products;
  },
  
  getProductById: (id) => {
    const { products } = get();
    return products.find(p => p.id === id);
  },
  
  // New selector to get only products available to the current sales role
  getAvailableProductsForSalesMember: () => {
    const { products, currentSalesRoleId, roleIncentives } = get();
    
    // If no current sales role is set, return empty array
    if (currentSalesRoleId === null) {
      return [];
    }
    
    // Get the role incentive for the current role
    const roleIncentive = roleIncentives.find(ri => ri.roleId === currentSalesRoleId);
    
    if (!roleIncentive) {
      // If no specific incentives are defined for this role, return only sellable products
      return products.filter(p => p.isSellable && p.selected);
    }
    
    // Return only the products that are both sellable and assigned to this role
    return products.filter(p => 
      p.isSellable && roleIncentive.productIds.includes(p.id)
    );
  },
  
  calculateCombinedIncentives: () => {
    const { products, selectedRoles, roleIncentives, userMode, currentSalesRoleId } = get();
    
    // In sales member mode, we only care about the current role
    const rolesToUse = userMode === 'sales' && currentSalesRoleId !== null 
      ? [currentSalesRoleId] 
      : selectedRoles;
    
    if (rolesToUse.length === 0) return [];
    
    // If we have roles selected but no products loaded yet, return empty
    if (products.length === 0) return [];
    
    // Get all products that are selected for at least one of the selected roles
    const uniqueProductIds = new Set<string>();
    
    // If no role incentives are defined yet, include all products
    if (roleIncentives.length === 0) {
      products.forEach(p => uniqueProductIds.add(p.id));
    } else {
      rolesToUse.forEach(roleId => {
        const roleIncentive = roleIncentives.find(ri => ri.roleId === roleId);
        if (roleIncentive && roleIncentive.productIds.length > 0) {
          roleIncentive.productIds.forEach(pid => {
            // In sales mode, only add sellable products
            const product = products.find(p => p.id === pid);
            if (product && (userMode === 'seller' || product.isSellable)) {
              uniqueProductIds.add(pid);
            }
          });
        } else {
          // If no specific products are assigned to this role, include all products
          products.filter(p => (userMode === 'seller' || p.isSellable))
            .forEach(p => uniqueProductIds.add(p.id));
        }
      });
    }
    
    // If no products are found after filtering, include all products for the selected roles
    if (uniqueProductIds.size === 0 && products.length > 0) {
      products.forEach(p => uniqueProductIds.add(p.id));
    }
    
    return Array.from(uniqueProductIds).map(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      
      // Calculate combined values - this is a simplified implementation
      // In a real app, you'd need more sophisticated commission calculation logic
      const combinedCommission = product.commission;
      const combinedBonus = product.bonus;
      
      return {
        productId,
        roleCombination: rolesToUse,
        combinedCommission,
        combinedBonus
      };
    }).filter(Boolean) as CombinedIncentive[];
  }
}));