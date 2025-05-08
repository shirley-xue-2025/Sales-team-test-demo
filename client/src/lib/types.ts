// Product and incentive plan types
export interface Product {
  id: string;
  name: string;
  created: string;
  commission: string;
  bonus: string;
  price?: string; // Price of the product
  isSellable?: boolean; // Whether the product is sellable
  selected?: boolean; // Flag to track if product is selected for a role
}

export interface Role {
  id: number;
  title: string;
  description: string;
  permissions?: string[] | unknown;
  isDefault: boolean;
  memberCount?: number;
}

export interface IncentivePlan {
  id: number;
  name: string;
  isDefault: boolean;
  products: Product[];
}

export interface RoleIncentive {
  roleId: number;
  productIds: string[];
}

export interface CombinedIncentive {
  productId: string;
  roleCombination: number[];
  combinedCommission: string;
  combinedBonus: string;
}