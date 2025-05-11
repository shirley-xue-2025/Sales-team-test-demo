import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { 
  roleInsertSchema, 
  roleValidationSchema, 
  productInsertSchema,
  roleProductInsertSchema
} from "@shared/schema";
import { 
  generateRoleDescription, 
  getTeamStructureRecommendations, 
  generateRolePermissions,
  RoleRecommendation 
} from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = '/api';
  
  // Get all roles
  app.get(`${apiPrefix}/roles`, async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch roles' });
    }
  });
  
  // Get role count
  app.get(`${apiPrefix}/roles/count`, async (req, res) => {
    try {
      const count = await storage.getRoleCount();
      res.json(count);
    } catch (error: any) {
      console.error('Error counting roles:', error);
      res.status(500).json({ message: error.message || 'Failed to count roles' });
    }
  });
  
  // Get role by ID
  app.get(`${apiPrefix}/roles/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(id);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json(role);
    } catch (error: any) {
      console.error('Error fetching role:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch role' });
    }
  });
  
  // Create role
  app.post(`${apiPrefix}/roles`, async (req, res) => {
    try {
      // First validate with custom rules
      const validData = roleValidationSchema.parse(req.body);
      // Then use the insert schema to ensure database compatibility
      const validatedData = roleInsertSchema.parse(validData);
      const newRole = await storage.createRole(validatedData);
      res.status(201).json(newRole);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Error creating role:', error);
      res.status(500).json({ message: error.message || 'Failed to create role' });
    }
  });
  
  // Update role
  app.put(`${apiPrefix}/roles/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(id);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // First validate with custom rules
      const validData = roleValidationSchema.parse(req.body);
      // Then use the insert schema to ensure database compatibility
      const validatedData = roleInsertSchema.parse(validData);
      const updatedRole = await storage.updateRole(id, validatedData);
      
      res.json(updatedRole);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Error updating role:', error);
      res.status(500).json({ message: error.message || 'Failed to update role' });
    }
  });
  
  // Delete role
  app.delete(`${apiPrefix}/roles/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(id);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.status(500).json({ message: error.message || 'Failed to delete role' });
    }
  });

  // Set role as default
  app.put(`${apiPrefix}/roles/:id/default`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(id);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      const updatedRole = await storage.setRoleAsDefault(id);
      res.status(200).json(updatedRole);
    } catch (error: any) {
      console.error('Error setting role as default:', error);
      res.status(500).json({ message: error.message || 'Failed to set role as default' });
    }
  });

  // Generate role description using AI
  app.post(`${apiPrefix}/generate-role-description`, async (req, res) => {
    try {
      const { roleName } = req.body;
      
      if (!roleName || typeof roleName !== 'string' || roleName.trim() === '') {
        return res.status(400).json({ message: 'Role name is required' });
      }
      
      const description = await generateRoleDescription(roleName);
      res.json({ description });
    } catch (error: any) {
      console.error('Error generating role description:', error);
      res.status(500).json({ message: error.message || 'Failed to generate role description' });
    }
  });

  // Get AI-recommended roles for a sales team
  app.post(`${apiPrefix}/recommend-roles`, async (req, res) => {
    try {
      const { 
        businessDescription, 
        existingRoles = [],
        targetMarket = "general",
        salesGoals = "growth" 
      } = req.body;
      
      if (!businessDescription || typeof businessDescription !== 'string' || businessDescription.trim() === '') {
        return res.status(400).json({ message: 'Business description is required' });
      }
      
      // Get role recommendations from OpenAI
      const recommendations = await getTeamStructureRecommendations(
        businessDescription,
        existingRoles,
        targetMarket,
        salesGoals
      );
      
      res.json({ recommendations });
    } catch (error: any) {
      console.error('Error generating role recommendations:', error);
      res.status(500).json({ message: error.message || 'Failed to generate role recommendations' });
    }
  });

  // Generate permissions for a role
  app.post(`${apiPrefix}/generate-role-permissions`, async (req, res) => {
    try {
      const { roleName, roleDescription } = req.body;
      
      if (!roleName || typeof roleName !== 'string' || roleName.trim() === '') {
        return res.status(400).json({ message: 'Role name is required' });
      }
      
      if (!roleDescription || typeof roleDescription !== 'string' || roleDescription.trim() === '') {
        return res.status(400).json({ message: 'Role description is required' });
      }
      
      const permissions = await generateRolePermissions(roleName, roleDescription);
      res.json({ permissions });
    } catch (error: any) {
      console.error('Error generating role permissions:', error);
      res.status(500).json({ message: error.message || 'Failed to generate role permissions' });
    }
  });

  // ===== PRODUCT ENDPOINTS =====

  // Get all products
  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      const products = await storage.getProductsWithRoleAssignments();
      res.json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch products' });
    }
  });

  // Get product by ID
  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch product' });
    }
  });

  // Create product
  app.post(`${apiPrefix}/products`, async (req, res) => {
    try {
      const validatedData = productInsertSchema.parse(req.body);
      const newProduct = await storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Error creating product:', error);
      res.status(500).json({ message: error.message || 'Failed to create product' });
    }
  });

  // Update product
  app.put(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const validatedData = productInsertSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(id, validatedData);
      
      res.json(updatedProduct);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      
      console.error('Error updating product:', error);
      res.status(500).json({ message: error.message || 'Failed to update product' });
    }
  });

  // Delete product
  app.delete(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const id = req.params.id;
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: error.message || 'Failed to delete product' });
    }
  });

  // Get products for a specific role
  app.get(`${apiPrefix}/roles/:roleId/products`, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      const products = await storage.getProductsForRole(roleId);
      res.json(products);
    } catch (error: any) {
      console.error('Error fetching products for role:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch products for role' });
    }
  });

  // Update role-product assignments
  app.put(`${apiPrefix}/roles/:roleId/products`, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }
      
      const role = await storage.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      const { productIds } = req.body;
      
      if (!Array.isArray(productIds)) {
        return res.status(400).json({ message: 'productIds must be an array' });
      }
      
      // Check if all products exist
      for (const productId of productIds) {
        const product = await storage.getProductById(productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${productId} not found` });
        }
      }
      
      // Update the assignments
      await storage.updateProductRoleAssignments(roleId, productIds);
      
      // Return the updated products for this role
      const updatedProducts = await storage.getProductsForRole(roleId);
      res.json(updatedProducts);
    } catch (error: any) {
      console.error('Error updating role-product assignments:', error);
      res.status(500).json({ message: error.message || 'Failed to update product assignments' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
