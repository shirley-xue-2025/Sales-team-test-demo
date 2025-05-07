import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Sales team roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  permissions: jsonb("permissions").notNull().default([]),
  isDefault: jsonb("is_default").notNull().default(false),
});

// Schemas for validation
export const roleInsertSchema = createInsertSchema(roles);

// Add custom validation with Zod
export const roleValidationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).min(1, "At least one permission must be selected"),
  isDefault: z.boolean().optional().default(false),
});

export const roleSelectSchema = createSelectSchema(roles);

// Types
export type RoleInsert = z.infer<typeof roleInsertSchema>;
export type Role = z.infer<typeof roleSelectSchema> & {
  memberCount?: number; // Virtual field for UI display purposes
};

// Users table (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
