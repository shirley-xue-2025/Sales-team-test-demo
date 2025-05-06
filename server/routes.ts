import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { roleInsertSchema, roleValidationSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
