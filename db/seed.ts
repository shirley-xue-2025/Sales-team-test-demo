import { db } from "./index";
import { roles } from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // For Version A, we'll clear the roles table and add only the Closer role
    console.log("Clearing existing roles for Version A...");
    await db.delete(roles);
    
    console.log("Adding Closer role for Version A...");
    await db.insert(roles).values({
      title: 'Closer',
      description: 'Responsible for closing deals with customers, managing client relationships, and ensuring customer satisfaction throughout the sales process.',
      permissions: ['edit', 'view'],
      isDefault: true
    });
    
    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
