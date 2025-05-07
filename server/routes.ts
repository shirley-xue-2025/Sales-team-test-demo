import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { roleInsertSchema, roleValidationSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
