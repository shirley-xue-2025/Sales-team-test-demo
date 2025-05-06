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
          title: 'Closer',
          description: 'Responsible for finalizing deals with clients and ensuring customer satisfaction with the purchase.',
          permissions: ['edit', 'view'],
          isDefault: true
        },
        {
          title: 'Setter',
          description: 'Responsible for initial client prospecting and scheduling appointments for Closers.',
          permissions: ['view'],
          isDefault: false
        },
        {
          title: 'Senior Closer',
          description: 'Handles high-value and complex sales deals. Has extensive sales experience and mentors other team members.',
          permissions: ['admin', 'edit', 'view'],
          isDefault: false
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
