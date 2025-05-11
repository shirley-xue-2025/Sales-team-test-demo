import { db } from "@db";
import { 
  roles, products, roleProducts,
  type RoleInsert, type Role,
  type ProductInsert, type Product,
  type RoleProductInsert
} from "@shared/schema";
import { and, eq, inArray } from "drizzle-orm";

export const storage = {
  // Roles
  getAllRoles: async (): Promise<Role[]> => {
    return await db.query.roles.findMany({
      orderBy: roles.id,
    });
  },
  
  getRoleCount: async (): Promise<number> => {
    const result = await db.select().from(roles);
    return result.length;
  },
  
  getRoleById: async (id: number): Promise<Role | undefined> => {
    const result = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
    return result;
  },
  
  createRole: async (data: RoleInsert): Promise<Role> => {
    // If this is the first role or explicitly set as default
    const roleCount = await storage.getRoleCount();
    const shouldBeDefault = roleCount === 0 || data.isDefault === true;
    
    // Set other roles to non-default if this one is default
    if (shouldBeDefault) {
      await db.update(roles).set({ isDefault: false }).where(eq(roles.isDefault, true));
    }
    
    const [role] = await db.insert(roles).values({
      ...data,
      isDefault: shouldBeDefault
    }).returning();
    
    return role;
  },
  
  updateRole: async (id: number, data: RoleInsert): Promise<Role> => {
    // If role is being set as default, clear other default roles
    if (data.isDefault === true) {
      await db.update(roles).set({ isDefault: false }).where(eq(roles.isDefault, true));
    }
    
    const [updatedRole] = await db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();
    
    return updatedRole;
  },
  
  deleteRole: async (id: number): Promise<void> => {
    try {
      // Check if this is a default role
      const roleToDelete = await storage.getRoleById(id);
      if (!roleToDelete) {
        throw new Error('Role not found');
      }
      
      console.log('Deleting role:', roleToDelete);
      
      // Step 1: Delete all role-product associations first
      await db.delete(roleProducts).where(eq(roleProducts.roleId, id));
      console.log('Deleted role-product associations');
      
      // Step 2: Delete the role
      const result = await db.delete(roles).where(eq(roles.id, id));
      console.log('Role deletion result:', result);
      
      // Step 3: If we deleted the default role, set another one as default if available
      if (roleToDelete.isDefault === true) {
        const remainingRoles = await storage.getAllRoles();
        if (remainingRoles.length > 0) {
          await db.update(roles)
            .set({ isDefault: true })
            .where(eq(roles.id, remainingRoles[0].id));
          console.log('Updated default role');
        }
      }
    } catch (error) {
      console.error('Error in deleteRole:', error);
      throw error; // Re-throw to handle in the route
    }
  },
  
  setRoleAsDefault: async (id: number): Promise<Role> => {
    // First, clear any existing default roles
    await db.update(roles).set({ isDefault: false }).where(eq(roles.isDefault, true));
    
    // Set the specified role as default
    const [updatedRole] = await db
      .update(roles)
      .set({ isDefault: true })
      .where(eq(roles.id, id))
      .returning();
    
    return updatedRole;
  },

  // Products
  getAllProducts: async (): Promise<Product[]> => {
    return await db.query.products.findMany({
      orderBy: products.name,
    });
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    return result;
  },

  createProduct: async (data: ProductInsert): Promise<Product> => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  },

  updateProduct: async (id: string, data: Partial<ProductInsert>): Promise<Product> => {
    const [updatedProduct] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    // First delete all role-product associations
    await db.delete(roleProducts).where(eq(roleProducts.productId, id));
    
    // Then delete the product
    await db.delete(products).where(eq(products.id, id));
  },

  // Role-Product Relationships
  getProductsForRole: async (roleId: number): Promise<Product[]> => {
    // Get all product IDs for this role
    const roleProductRelations = await db.select({
      productId: roleProducts.productId
    })
    .from(roleProducts)
    .where(eq(roleProducts.roleId, roleId));
    
    const productIds = roleProductRelations.map(rp => rp.productId);
    
    if (productIds.length === 0) {
      return [];
    }
    
    // Get all products with these IDs
    return await db.query.products.findMany({
      where: inArray(products.id, productIds)
    });
  },

  assignProductToRole: async (roleId: number, productId: string): Promise<void> => {
    // Check if the assignment already exists
    const existing = await db.select()
      .from(roleProducts)
      .where(
        and(
          eq(roleProducts.roleId, roleId),
          eq(roleProducts.productId, productId)
        )
      );
    
    // Only insert if it doesn't exist yet
    if (existing.length === 0) {
      await db.insert(roleProducts).values({
        roleId,
        productId
      });
    }
  },

  removeProductFromRole: async (roleId: number, productId: string): Promise<void> => {
    await db.delete(roleProducts)
      .where(
        and(
          eq(roleProducts.roleId, roleId),
          eq(roleProducts.productId, productId)
        )
      );
  },

  getProductsWithRoleAssignments: async (): Promise<Product[]> => {
    // First get all products
    const allProducts = await storage.getAllProducts();
    
    // Then get all role-product assignments
    const allRoleProducts = await db.select().from(roleProducts);
    
    // Create a map of product IDs to role IDs
    const productRoleMap: Record<string, number[]> = {};
    
    for (const rp of allRoleProducts) {
      if (!productRoleMap[rp.productId]) {
        productRoleMap[rp.productId] = [];
      }
      productRoleMap[rp.productId].push(rp.roleId);
    }
    
    // Mark each product as selected if it has any role assignments
    return allProducts.map(product => ({
      ...product,
      selected: Boolean(productRoleMap[product.id]?.length)
    }));
  },

  updateProductRoleAssignments: async (
    roleId: number, 
    productIds: string[]
  ): Promise<void> => {
    // Get current assignments for this role
    const currentAssignments = await db
      .select({ productId: roleProducts.productId })
      .from(roleProducts)
      .where(eq(roleProducts.roleId, roleId));
    
    const currentProductIds = currentAssignments.map(a => a.productId);
    
    // Products to add (in productIds but not in currentProductIds)
    const toAdd = productIds.filter(id => !currentProductIds.includes(id));
    
    // Products to remove (in currentProductIds but not in productIds)
    const toRemove = currentProductIds.filter(id => !productIds.includes(id));
    
    // Add new assignments
    if (toAdd.length > 0) {
      const valuesToInsert = toAdd.map(productId => ({
        roleId,
        productId
      }));
      
      await db.insert(roleProducts).values(valuesToInsert);
    }
    
    // Remove old assignments
    if (toRemove.length > 0) {
      await db.delete(roleProducts)
        .where(
          and(
            eq(roleProducts.roleId, roleId),
            inArray(roleProducts.productId, toRemove)
          )
        );
    }
  }
};
