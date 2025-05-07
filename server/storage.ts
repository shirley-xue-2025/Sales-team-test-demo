import { db } from "@db";
import { roles, type RoleInsert, type Role } from "@shared/schema";
import { eq } from "drizzle-orm";

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
    // Check if this is a default role
    const roleToDelete = await storage.getRoleById(id);
    
    // Delete the role
    await db.delete(roles).where(eq(roles.id, id));
    
    // If we deleted the default role, set another one as default if available
    if (roleToDelete?.isDefault === true) {
      const remainingRoles = await storage.getAllRoles();
      if (remainingRoles.length > 0) {
        await db.update(roles)
          .set({ isDefault: true })
          .where(eq(roles.id, remainingRoles[0].id));
      }
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
};
