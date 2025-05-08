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
  fetchRoleProducts: (roleId: number) => Promise<void>;
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
    
    set({ roleIncentives: updatedIncentives });
    
    // Then update the database
    try {
      set({ isUpdatingProducts: true });
      
      // Get all product IDs for this role
      const productIds = get().getSelectedProductsForRole(roleId).map(p => p.id);
      
      // Send the update to the backend
      await get().updateRoleProducts(roleId, productIds);
      
      // Update the selected status of the product in the products array
      const updatedProducts = products.map(p => 
        p.id === productId 
          ? { ...p, selected } 
          : p
      );
      
      set({ products: updatedProducts });
    } catch (error) {
      console.error('Error updating product selection:', error);
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
      const products = await apiRequest<Product[]>('/api/products', {
        method: 'GET'
      });
      set({ products });
      
      // Initialize roleIncentives based on product selected status
      const roleIncentives: RoleIncentive[] = [];
      
      // Group products by their role assignments
      const roleMap: Record<number, string[]> = {};
      
      // Get all roles
      const { roles } = get();
      
      // Fetch products for each role
      for (const role of roles) {
        try {
          const roleProducts = await apiRequest<Product[]>(`/api/roles/${role.id}/products`, {
            method: 'GET'
          });
          if (roleProducts && roleProducts.length > 0) {
            roleMap[role.id] = roleProducts.map((p: Product) => p.id);
          }
        } catch (error) {
          console.error(`Error fetching products for role ${role.id}:`, error);
        }
      }
      
      // Create role incentives array from the role map
      for (const [roleId, productIds] of Object.entries(roleMap)) {
        if (productIds.length > 0) {
          roleIncentives.push({
            roleId: parseInt(roleId),
            productIds
          });
        }
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
      await apiRequest('/api/roles/' + roleId + '/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds })
      });
      
      // Refresh products for this role
      await get().fetchRoleProducts(roleId);
    } catch (error) {
      console.error(`Error updating products for role ${roleId}:`, error);
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
    
    // Get all products that are selected for at least one of the selected roles
    const uniqueProductIds = new Set<string>();
    
    rolesToUse.forEach(roleId => {
      const roleIncentive = roleIncentives.find(ri => ri.roleId === roleId);
      if (roleIncentive) {
        roleIncentive.productIds.forEach(pid => {
          // In sales mode, only add sellable products
          const product = products.find(p => p.id === pid);
          if (product && (userMode === 'seller' || product.isSellable)) {
            uniqueProductIds.add(pid);
          }
        });
      } else {
        // Use default selected products
        products.filter(p => p.selected && (userMode === 'seller' || p.isSellable))
          .forEach(p => uniqueProductIds.add(p.id));
      }
    });
    
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