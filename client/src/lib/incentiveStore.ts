import { create } from 'zustand';
import { Product, Role, RoleIncentive, CombinedIncentive } from './types';

// Realistic coaching product names with proper Euro symbol for bonuses
const mockProducts: Product[] = [
  { id: "352041", name: "1-on-1 Strategy Session", created: "08.01.2024", commission: "20%", bonus: "5€", selected: true },
  { id: "349274", name: "Business Growth Masterclass", created: "20.12.2023", commission: "20%", bonus: "10€", selected: true },
  { id: "302985", name: "Leadership Coaching Program", created: "04.05.2023", commission: "15%", bonus: "15€", selected: true },
  { id: "302984", name: "Sales Acceleration Workshop", created: "04.06.2023", commission: "10%", bonus: "20€", selected: false },
  { id: "445504", name: "Marketing Mindset Course", created: "—", commission: "15%", bonus: "5€", selected: false },
  { id: "443939", name: "CEO Mentoring Package", created: "—", commission: "25%", bonus: "25€", selected: false },
  { id: "441233", name: "Social Media Authority Program", created: "—", commission: "20%", bonus: "15€", selected: false },
  { id: "123456", name: "Email Marketing Mastery", created: "15.02.2024", commission: "10%", bonus: "5€", selected: true },
  { id: "234567", name: "Client Acquisition System", created: "22.03.2024", commission: "25%", bonus: "10€", selected: true },
  { id: "345678", name: "Business Scaling Blueprint", created: "10.01.2024", commission: "30%", bonus: "15€", selected: true },
];

interface IncentiveStore {
  // Data
  products: Product[];
  roles: Role[];
  roleIncentives: RoleIncentive[];
  mode: 'view' | 'edit';
  selectedRoles: number[];
  
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
  
  // Selectors
  getSelectedProductsForRole: (roleId: number) => Product[];
  getAllProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  calculateCombinedIncentives: () => CombinedIncentive[];
}

export const useIncentiveStore = create<IncentiveStore>((set, get) => ({
  // Data
  products: mockProducts,
  roles: [],
  roleIncentives: [],
  mode: 'view',
  selectedRoles: [],
  
  // UI State
  activeTab: 'default',
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setMode: (mode) => set({ mode }),
  
  toggleProductSelection: (productId, roleId, selected) => {
    const { roleIncentives } = get();
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
    const { products } = get();
    return products;
  },
  
  getProductById: (id) => {
    const { products } = get();
    return products.find(p => p.id === id);
  },
  
  calculateCombinedIncentives: () => {
    const { products, selectedRoles, roleIncentives } = get();
    if (selectedRoles.length === 0) return [];
    
    // Get all products that are selected for at least one of the selected roles
    const uniqueProductIds = new Set<string>();
    
    selectedRoles.forEach(roleId => {
      const roleIncentive = roleIncentives.find(ri => ri.roleId === roleId);
      if (roleIncentive) {
        roleIncentive.productIds.forEach(pid => uniqueProductIds.add(pid));
      } else {
        // Use default selected products
        products.filter(p => p.selected).forEach(p => uniqueProductIds.add(p.id));
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
        roleCombination: selectedRoles,
        combinedCommission,
        combinedBonus
      };
    }).filter(Boolean) as CombinedIncentive[];
  }
}));