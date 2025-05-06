import { db } from "./index";
import { roles } from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Check if roles exist
    const existingRoles = await db.query.roles.findMany();
    
    // Only seed if no roles exist yet
    if (existingRoles.length === 0) {
      console.log("No existing roles found. Seeding roles...");
      
      // Seed roles
      const seedRoles = [
        {
          title: 'Sales Manager',
          description: 'Oversees the sales team and strategy implementation. Responsible for team performance and meeting targets.',
          permissions: ['admin', 'edit', 'view'],
        },
        {
          title: 'Account Executive',
          description: 'Responsible for managing client accounts and sales processes. Works with clients to understand needs and propose solutions.',
          permissions: ['edit', 'view'],
        },
        {
          title: 'Sales Representative',
          description: 'Handles direct sales with customers. Responsible for prospecting, presenting, and closing deals with new customers.',
          permissions: ['view'],
        },
      ];
      
      for (const role of seedRoles) {
        await db.insert(roles).values(role);
      }
      
      console.log("Roles seeded successfully!");
    } else {
      console.log(`Found ${existingRoles.length} existing roles. Skipping role seeding.`);
    }
    
    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
