import { db } from "./index";
import { roles, products, roleProducts } from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // ROLES
    console.log("Clearing existing roles for Version A...");
    await db.delete(roles);
    
    console.log("Adding Closer role for Version A...");
    const [closerRole] = await db.insert(roles).values({
      title: 'Closer',
      description: 'Responsible for closing deals with customers, managing client relationships, and ensuring customer satisfaction throughout the sales process.',
      permissions: ['edit', 'view'],
      isDefault: true
    }).returning();

    // Add Sales Manager (Setter) role
    const [setterRole] = await db.insert(roles).values({
      title: 'Setter',
      description: 'Qualifies leads and schedules appointments for closers',
      permissions: ['edit', 'view'],
      isDefault: false
    }).returning();

    // Add Junior Closer role
    const [juniorCloserRole] = await db.insert(roles).values({
      title: 'Junior Closer',
      description: 'Responsible for converting qualified prospects into clients',
      permissions: ['edit', 'view'],
      isDefault: false
    }).returning();

    // Add Senior Closer role
    const [seniorCloserRole] = await db.insert(roles).values({
      title: 'Senior Closer',
      description: 'Handles high-value clients and complex sales situations',
      permissions: ['edit', 'view'],
      isDefault: false
    }).returning();
    
    // PRODUCTS
    console.log("Seeding products...");
    // Clear existing products
    await db.delete(products);
    
    // Add products
    const productData = [
      {
        id: '1-on-1',
        name: '1-on-1 Strategy Session',
        commission: '10%',
        bonus: '50€',
        price: '499€',
        isSellable: true
      },
      {
        id: 'business-growth',
        name: 'Business Growth Masterclass',
        commission: '15%',
        bonus: '100€',
        price: '1299€',
        isSellable: true
      },
      {
        id: 'leadership',
        name: 'Leadership Coaching Program',
        commission: '20%',
        bonus: '200€',
        price: '2499€',
        isSellable: true
      },
      {
        id: 'sales-workshop',
        name: 'Sales Acceleration Workshop',
        commission: '12%',
        bonus: '75€',
        price: '799€',
        isSellable: false
      },
      {
        id: 'email-marketing',
        name: 'Email Marketing Mastery',
        commission: '8%',
        bonus: '40€',
        price: '399€',
        isSellable: true
      },
      {
        id: 'client-acquisition',
        name: 'Client Acquisition System',
        commission: '18%',
        bonus: '150€',
        price: '1999€',
        isSellable: true
      },
      {
        id: 'scaling-blueprint',
        name: 'Business Scaling Blueprint',
        commission: '22%',
        bonus: '250€',
        price: '2999€',
        isSellable: true
      }
    ];
    
    for (const product of productData) {
      await db.insert(products).values(product);
    }
    
    // ROLE-PRODUCT ASSIGNMENTS
    console.log("Assigning products to roles...");
    // Clear existing role-product assignments
    await db.delete(roleProducts);
    
    // Closer role gets access to all sellable products
    const sellableProductIds = productData
      .filter(p => p.isSellable)
      .map(p => p.id);
    
    for (const productId of sellableProductIds) {
      await db.insert(roleProducts).values({
        roleId: closerRole.id,
        productId
      });
    }
    
    // Setter role gets access to some products
    const setterProductIds = ['1-on-1', 'email-marketing', 'client-acquisition'];
    for (const productId of setterProductIds) {
      await db.insert(roleProducts).values({
        roleId: setterRole.id,
        productId
      });
    }
    
    // Junior Closer role gets access to some products
    const juniorCloserProductIds = ['1-on-1', 'business-growth', 'email-marketing'];
    for (const productId of juniorCloserProductIds) {
      await db.insert(roleProducts).values({
        roleId: juniorCloserRole.id,
        productId
      });
    }
    
    // Senior Closer role gets access to high-value products
    const seniorCloserProductIds = ['leadership', 'client-acquisition', 'scaling-blueprint'];
    for (const productId of seniorCloserProductIds) {
      await db.insert(roleProducts).values({
        roleId: seniorCloserRole.id,
        productId
      });
    }
    
    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
