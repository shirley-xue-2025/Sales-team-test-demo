import { create } from 'zustand';
import { Product, Role, RoleIncentive, CombinedIncentive, Member } from './types';
import { apiRequest } from './queryClient';

// Type for user mode/context
export type UserMode = 'seller' | 'sales';

interface IncentiveStore {
  // Data
  products: Product[];
  roles: Role[];
  roleIncentives: RoleIncentive[];
  members: Member[];
  currentMemberId: number | null;
  mode: 'view' | 'edit';
  selectedRoles: number[];
  userMode: UserMode; // Field to track if user is seller or sales member
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
  
  // Member management
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  updateMember: (id: number, updates: Partial<Member>) => void;
  removeMember: (id: number) => void;
  switchToMember: (id: number | null) => void;
  getCurrentMember: () => Member | null;
  
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
  members: [
    {
      id: 1,
      name: "Muhammad Gunes",
      email: "muhammad.gunes@example.com",
      roleId: 25, // Default to the first role initially
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Muhammad"
    }
  ],
  currentMemberId: null,
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
    console.log(`updateRoleProducts called for role ${roleId} with product IDs:`, productIds);
    try {
      set({ isUpdatingProducts: true });
      
      // Send update to backend - ensure this completes successfully
      const response = await apiRequest('PUT', `/api/roles/${roleId}/products`, { 
        body: JSON.stringify({ productIds }) 
      });
      console.log('API response status:', response.status);
      
      const updatedProducts = await response.json() as Product[];
      console.log('Products returned from API:', updatedProducts);
      
      if (!updatedProducts || updatedProducts.length === 0) {
        console.warn(`Warning: No products returned after update for role ${roleId}`);
        // Continue with local update instead of throwing error
      }
      
      // Update local state with the new product IDs for this role
      const roleIncentives = get().roleIncentives;
      console.log('Current role incentives:', roleIncentives);
      
      const updatedIncentives = [...roleIncentives];
      const existingIndex = updatedIncentives.findIndex(ri => ri.roleId === roleId);
      
      if (existingIndex >= 0) {
        console.log(`Updating existing incentive for role ${roleId}`);
        updatedIncentives[existingIndex] = {
          ...updatedIncentives[existingIndex],
          productIds: [...productIds] // Make a copy to avoid reference issues
        };
      } else if (productIds.length > 0) {
        console.log(`Creating new incentive for role ${roleId}`);
        updatedIncentives.push({
          roleId,
          productIds: [...productIds] // Make a copy to avoid reference issues
        });
      }
      
      console.log('Updated incentives:', updatedIncentives);
      set({ roleIncentives: updatedIncentives });
      
      // Mark products as selected/unselected in the products array
      const allProducts = get().products;
      const updatedProducts2 = allProducts.map(product => {
        const isSelected = productIds.includes(product.id);
        console.log(`Setting product ${product.id} selection status to:`, isSelected);
        return { ...product, selected: isSelected };
      });
      
      set({ products: updatedProducts2 });
      console.log('Products updated in store');
      
      // Refresh products for this role from the server to ensure consistency
      console.log('Refreshing products from server...');
      const refreshedProducts = await get().fetchRoleProducts(roleId);
      console.log('Refreshed products:', refreshedProducts);
      
      set({ isUpdatingProducts: false });
      return updatedProducts.length > 0 ? updatedProducts : refreshedProducts;
    } catch (error) {
      console.error(`Error updating products for role ${roleId}:`, error);
      set({ isUpdatingProducts: false });
      
      // Re-fetch products from server to ensure consistency after an error
      try {
        console.log('Refreshing all products after error...');
        await get().fetchProducts();
      } catch (fetchError) {
        console.error('Failed to refresh products after error:', fetchError);
      }
      
      // Return empty array instead of throwing
      return [];
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
  },
  
  // Member management functions
  setMembers: (members) => {
    set({ members });
  },
  
  addMember: (member) => {
    set(state => ({
      members: [...state.members, member]
    }));
  },
  
  updateMember: (id, updates) => {
    set(state => {
      const memberIndex = state.members.findIndex(m => m.id === id);
      if (memberIndex === -1) return state;
      
      const updatedMembers = [...state.members];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        ...updates
      };
      
      return { members: updatedMembers };
    });
  },
  
  removeMember: (id) => {
    set(state => ({
      members: state.members.filter(m => m.id !== id)
    }));
  },
  
  switchToMember: (id) => {
    // If null, switch back to seller mode
    if (id === null) {
      set({ 
        currentMemberId: null,
        userMode: 'seller',
        currentSalesRoleId: null
      });
      return;
    }
    
    // Set current member and switch to sales mode
    set(state => {
      const member = state.members.find(m => m.id === id);
      
      // If member not found, don't change anything
      if (!member) return state;
      
      return {
        currentMemberId: id,
        userMode: 'sales',
        currentSalesRoleId: member.roleId
      };
    });
  },
  
  getCurrentMember: () => {
    const { members, currentMemberId } = get();
    if (currentMemberId === null) return null;
    return members.find(m => m.id === currentMemberId) || null;
  }
}));