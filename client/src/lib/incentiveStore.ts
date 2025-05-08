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
  updateRoleProducts: (roleId: number, productIds: string[]) => Promise<void>;
  
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
    console.log(`Toggle product ${productId} for role ${roleId} to ${selected}`);
    
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
      
      console.log(`Saving product selection to backend for role ${roleId}:`, productIds);
      
      // Send the update to the backend
      await apiRequest(`/api/roles/${roleId}/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds })
      });
      
      // Update the selected status of the product in the products array
      const updatedProducts = products.map(p => 
        p.id === productId 
          ? { ...p, selected } 
          : p
      );
      
      set({ products: updatedProducts });
      
      // Refresh products for this role to ensure consistency
      await get().fetchRoleProducts(roleId);
      
      console.log('Product selection saved successfully');
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
      
      console.log('Fetching products from API...');
      const products = await apiRequest<Product[]>('/api/products', {
        method: 'GET'
      });
      
      console.log('Products fetched:', products);
      
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
      
      console.log('Fetching products for each role...');
      
      // Fetch products for each role
      for (const role of roles) {
        try {
          const roleProducts = await apiRequest<Product[]>(`/api/roles/${role.id}/products`, {
            method: 'GET'
          });
          
          console.log(`Products for role ${role.id}:`, roleProducts);
          
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
      
      console.log('Role map:', roleMap);
      
      // Create role incentives array from the role map
      for (const [roleId, productIds] of Object.entries(roleMap)) {
        roleIncentives.push({
          roleId: parseInt(roleId),
          productIds
        });
      }
      
      console.log('Setting role incentives:', roleIncentives);
      set({ roleIncentives });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      set({ isLoadingProducts: false });
    }
  },
  
  fetchRoleProducts: async (roleId) => {
    try {
      const roleProducts = await apiRequest<Product[]>(`/api/roles/${roleId}/products`, {
        method: 'GET'
      });
      
      if (!roleProducts) return [];
      
      const roleProductIds = roleProducts.map((p: Product) => p.id);
      
      // Update roleIncentives
      const { roleIncentives } = get();
      let updatedIncentives = [...roleIncentives];
      
      const existingIndex = updatedIncentives.findIndex(ri => ri.roleId === roleId);
      
      if (existingIndex >= 0) {
        updatedIncentives[existingIndex] = {
          ...updatedIncentives[existingIndex],
          productIds: roleProductIds
        };
      } else if (roleProductIds.length > 0) {
        updatedIncentives.push({
          roleId,
          productIds: roleProductIds
        });
      }
      
      set({ roleIncentives: updatedIncentives });
      
      return roleProducts;
    } catch (error) {
      console.error(`Error fetching products for role ${roleId}:`, error);
      return [];
    }
  },
  
  updateRoleProducts: async (roleId, productIds) => {
    try {
      set({ isUpdatingProducts: true });
      console.log(`Updating products for role ${roleId} with:`, productIds);
      
      // Send update to backend
      const updatedProducts = await apiRequest('/api/roles/' + roleId + '/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds })
      });
      
      console.log(`Backend returned updated products for role ${roleId}:`, updatedProducts);
      
      // Update local state with the new product IDs for this role
      const roleIncentives = get().roleIncentives;
      const updatedIncentives = [...roleIncentives];
      const existingIndex = updatedIncentives.findIndex(ri => ri.roleId === roleId);
      
      if (existingIndex >= 0) {
        updatedIncentives[existingIndex] = {
          ...updatedIncentives[existingIndex],
          productIds
        };
      } else if (productIds.length > 0) {
        updatedIncentives.push({
          roleId,
          productIds
        });
      }
      
      set({ roleIncentives: updatedIncentives });
      console.log('Updated roleIncentives:', updatedIncentives);
      
      // Refresh products for this role to ensure consistency
      await get().fetchRoleProducts(roleId);
      
      set({ isUpdatingProducts: false });
    } catch (error) {
      console.error(`Error updating products for role ${roleId}:`, error);
      set({ isUpdatingProducts: false });
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
    
    // For debug purposes
    console.log('Calculate Combined Incentives');
    console.log('Products:', products);
    console.log('Selected Roles:', selectedRoles);
    console.log('Role Incentives:', roleIncentives);
    
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