import { pgTable, text, serial, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Sales team roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  permissions: jsonb("permissions").default([]), // Made optional, keeping the field to avoid breaking changes
  isDefault: jsonb("is_default").notNull().default(false),
});

// Products table
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  created: timestamp("created").defaultNow().notNull(),
  commission: text("commission").notNull().default("0%"),
  bonus: text("bonus").notNull().default("0€"),
  price: text("price"),
  isSellable: boolean("is_sellable").default(true)
});

// Role-Products relation table (many-to-many)
export const roleProducts = pgTable("role_products", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull()
});

// Define relationships
export const rolesRelations = relations(roles, ({ many }) => ({
  roleProducts: many(roleProducts)
}));

export const productsRelations = relations(products, ({ many }) => ({
  roleProducts: many(roleProducts)
}));

export const roleProductsRelations = relations(roleProducts, ({ one }) => ({
  role: one(roles, {
    fields: [roleProducts.roleId],
    references: [roles.id]
  }),
  product: one(products, {
    fields: [roleProducts.productId],
    references: [products.id]
  })
}));

// Schemas for validation
export const roleInsertSchema = createInsertSchema(roles);

// Add custom validation with Zod
export const roleValidationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  permissions: z.array(z.string()).optional().default([]), // Made optional
  isDefault: z.boolean().optional().default(false),
});

export const roleSelectSchema = createSelectSchema(roles);

// Product schemas
export const productInsertSchema = createInsertSchema(products, {
  name: (schema) => schema.min(2, "Product name must be at least 2 characters"),
  commission: (schema) => schema.regex(/^\d+%$/, "Commission must be in format '10%'"),
  bonus: (schema) => schema.regex(/^\d+€$/, "Bonus must be in format '100€'")
});

export const productSelectSchema = createSelectSchema(products);

// Role-Products schemas
export const roleProductInsertSchema = createInsertSchema(roleProducts);
export const roleProductSelectSchema = createSelectSchema(roleProducts);

// Types
export type RoleInsert = z.infer<typeof roleInsertSchema>;
export type Role = z.infer<typeof roleSelectSchema> & {
  memberCount?: number; // Virtual field for UI display purposes
};

export type ProductInsert = z.infer<typeof productInsertSchema>;
export type Product = z.infer<typeof productSelectSchema> & {
  selected?: boolean; // Virtual field for UI display purposes
};

export type RoleProductInsert = z.infer<typeof roleProductInsertSchema>;
export type RoleProduct = z.infer<typeof roleProductSelectSchema>;

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
