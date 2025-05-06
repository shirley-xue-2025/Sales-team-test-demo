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
    const result = await db.select({ count: db.fn.count() }).from(roles);
    return Number(result[0].count);
  },
  
  getRoleById: async (id: number): Promise<Role | undefined> => {
    const result = await db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
    return result;
  },
  
  createRole: async (data: RoleInsert): Promise<Role> => {
    const [role] = await db.insert(roles).values(data).returning();
    return role;
  },
  
  updateRole: async (id: number, data: RoleInsert): Promise<Role> => {
    const [updatedRole] = await db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  },
  
  deleteRole: async (id: number): Promise<void> => {
    await db.delete(roles).where(eq(roles.id, id));
  },
};
