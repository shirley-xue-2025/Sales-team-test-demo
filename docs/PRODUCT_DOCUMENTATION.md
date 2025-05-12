# Sales Team Management Platform Documentation

## Part 1: Structure and Features

### User Roles

The application supports two primary account types:

1. **Sales Team Admin**: Manages the sales team, roles, products, and incentive plans
2. **Sales Team Member**: Views and manages assigned products, deals, and personal performance

### As a Sales Team Admin

#### Dashboard and Analytics
- I can see a comprehensive dashboard with key metrics for my sales team, including:
  - Monthly revenue trends
  - Sales by product distribution
  - Team member performance
  - Active deals count
  - Conversion rate metrics
  - Average deal size

#### Role Management
- I can create, edit, and delete sales roles with:
  - Custom titles and descriptions
  - Default role designation
- I can use AI-powered role descriptions to create appropriate descriptions for new roles
- I can view the number of members assigned to each role
- When I remove a default role, another role must become default
- When there is only one role, it cannot be removed

#### Incentive Plan Configuration
- I can configure the team's incentive plan from a single dedicated page that shows:
  - All products from my company's catalog with their prices
  - A visual indicator (checkmark) showing which products are currently selected for the sales team
  - Commission percentages and bonus amounts for each product, broken down by role
  - A "Change products" button that allows me to select or deselect products from the company catalog
  - An "Edit incentives" button to modify commission and bonus values
  
- I can select which products from my company's catalog are included in the sales team by:
  - Clicking the "Change products" button on the incentive plan page
  - Checking or unchecking products in the selection modal
  - The selection determines which products are visible to all sales team members

- I can set different commission percentages and bonus amounts for each product per role:
  - Each role (e.g., Closer, Setter, Senior Closer) has its own commission percentage and bonus amount columns
  - The total combined commission and bonus is automatically calculated and displayed

- I can simulate team collaboration scenarios:
  - Select different combinations of roles to see how commissions and bonuses would be distributed
  - View the combined incentive totals when multiple roles collaborate on the same deal

#### Product Visibility and Management
- There is no separate product management page - all product selection is handled through the incentive plan page
- The company's product catalog is pre-populated with products (e.g., Strategy Sessions, Masterclasses, Workshops)
- I can only select or deselect existing products from the catalog to include in my sales team
- All selected products are visible to all sales team members, but with role-specific commission and bonus values
- The "Sellable" column indicates which products are currently available for sale to customers

#### Member Management
- I can add and manage team members by:
  - Assigning them to a specific role (a member always has exactly one role)
  - Setting them as active or inactive
  - Viewing their profile information and performance
  - Monitoring their deal history and commissions earned

### As a Sales Team Member

#### Personal Dashboard
- I can view my personal dashboard showing:
  - My current deals and their statuses
  - Monthly performance metrics for commissions and bonuses
  - Completion rate for deals
  - Distribution of deal statuses (Draft, Upcoming, Ready, Cancelled, Paid)

#### Product Access
- I can see all products that have been selected for the sales team by the admin on my product page
- For each product, I can view:
  - Product name and category
  - Product price
  - My commission percentage and bonus amount based on my role
  - Whether the product is sellable (available for sale)

#### Deal Management
- I can create and manage deals by:
  - Creating new deals for available products
  - Adding customer information
  - Selecting payment plans
  - Tracking the deal status through the sales pipeline
  - Viewing my commission and bonus for each deal

#### Invitations
- I can view and respond to invitations to join sales teams
- I can see which teams I'm a member of and my role in each team

## Part 2: Code Base Mapping

### User Role System
- **Database Schema**: Defined in `shared/schema.ts`
  - `roles` table with fields for ID, title, description, and default status
  - `Role` type extends with a virtual `memberCount` field for UI display
- **Frontend Components**: 
  - Role management UI in `client/src/components/sales/role-card.tsx`
  - Role editing in `client/src/components/sales/role-form.tsx`
  - Role deletion dialog in `client/src/components/sales/delete-role-dialog.tsx`
  - AI-powered role descriptions in `client/src/components/sales/role-recommendation-modal.tsx`

### Product Management System
- **Database Schema**: Defined in `shared/schema.ts`
  - `products` table with fields for ID, name, commission, bonus, price, sellability
  - `Product` type includes virtual fields for UI state like `selected`
- **Frontend Components**:
  - Product table in `client/src/components/incentive/product-table.tsx`
  - Product selection in `client/src/components/incentive/product-selection-modal.tsx`
  - Incentive plan page in `client/src/pages/incentive-plan.tsx`

### Role-Product Relationship
- **Database Schema**: `roleProducts` junction table in `shared/schema.ts`
  - Many-to-many relationship between roles and products for tracking incentives
- **API Endpoints**: 
  - `PUT /api/roles/:roleId/products` to update product incentives
  - Get products for a role with `getProductsForRole` in storage layer
- **State Management**:
  - Zustand store in `client/src/lib/incentiveStore.ts`
  - Provides methods like `toggleProductSelection`, `updateRoleProducts`, `getSelectedProductsForRole`

### Incentive Management
- **Frontend Components**:
  - Role comparison view in `client/src/components/incentive/role-comparison.tsx`
  - Product table with commission/bonus display
- **State Management**:
  - Incentive calculations in `client/src/lib/incentiveStore.ts`
  - Combined incentives calculation with `calculateCombinedIncentives`

### User Mode Switching
- **State Management**:
  - Mode switching between admin and member with `userMode` in `client/src/lib/incentiveStore.ts`
  - `setUserMode` and `setCurrentSalesRole` methods to change perspectives
  - Conditional rendering based on user mode throughout the application

### Sales Member Experience
- **Page Components**:
  - Overview dashboard in `client/src/pages/sales-member/overview.tsx`
  - Products view in `client/src/pages/sales-member/products.tsx`
  - Deals management in `client/src/pages/sales-member/deals.tsx`
  - Deal details in `client/src/pages/sales-member/deal-details.tsx`
  - Invitations in `client/src/pages/sales-member/invitations.tsx`

### Deal Management
- **Data Models**:
  - Deal interface in `client/src/pages/sales-member/deals.tsx`
  - Contains product information, customer details, pricing, and status
- **UI Components**:
  - Deal listing with filtering in deals page
  - Status badges with visual indicators for deal stages
  - Deal detail view with customer and product information

### Member Management
- **Data Models**:
  - `Member` interface in `client/src/lib/types.ts`
  - Contains ID, name, email, roleID, and optional avatar URL
- **State Management**:
  - Member-related methods in `client/src/lib/incentiveStore.ts`
  - `setMembers`, `addMember`, `updateMember`, `removeMember` methods
  - Current member tracking with `switchToMember` and `getCurrentMember`

### AI Integration
- **OpenAI Service**:
  - AI-powered features in `server/services/openai.ts`
  - Role description generation with `generateRoleDescription`

### Dashboard Analytics
- **Data Visualization**:
  - Charts built with Recharts library
  - Revenue trends with bar charts
  - Product distribution with pie charts
  - Performance metrics with progress indicators
  - Deal status visualization

## Implementation Plan

### 1. Role Management Updates

#### Remove Permissions-Related Code
- Update `shared/schema.ts`:
  - Remove permissions field from roles table or make it optional
  - Update validation schemas to remove permission requirements
- Update `client/src/components/sales/role-card.tsx`:
  - Remove PermissionBadge component
  - Remove permission display from role cards
- Update `client/src/components/sales/role-form.tsx`:
  - Remove permission selection fields
  - Update form validation to not require permissions
- Modify `server/services/openai.ts`:
  - Remove `generateRolePermissions` function or make it optional

#### Add Default Role Management Logic
- Update `server/routes.ts`:
  - Modify DELETE endpoint for roles to check if it's the last role
  - Add logic to assign a new default role if the current default is deleted
  - Return appropriate error messages when deletion is not allowed
- Update `client/src/pages/roles.tsx`:
  - Add check to disable delete button for the only remaining role
  - Add confirmation dialog for deleting default roles with explanation

### 2. Incentive Plan and Product Selection

#### Update Product Selection Process
- Modify `client/src/components/incentive/product-selection-modal.tsx`:
  - Update UI text to clarify that selection affects all roles
  - Add informative tooltips explaining team-wide product visibility
- Update `client/src/pages/incentive-plan.tsx`:
  - Ensure UI clearly shows that products are selected for the entire team
  - Update any misleading variable names or comments

#### Improve Role Comparison Component
- Update `client/src/components/incentive/role-comparison.tsx`:
  - Ensure UI makes it clear that product selection is team-wide
  - Focus UI on showing different commission/bonus values per role
  - Improve the simulation feature for role combinations

### 3. Member Management Improvements

#### Enforce Single Role Assignment
- Update member-related functions in `client/src/lib/incentiveStore.ts`:
  - Ensure members always have exactly one role
  - Add validation to prevent role removal without replacement
- Update UI components:
  - Modify forms to make role selection required
  - Add clear validation messages about role requirements

### 4. User Experience and Navigation

#### Clarify Admin vs. Member Mode
- Enhance the mode switching UI:
  - Add clearer indications of current mode
  - Provide informative tooltips about mode differences
- Update navigation elements to reflect available actions in each mode

#### Improve Product Visibility for Sales Members
- Update `client/src/pages/sales-member/products.tsx`:
  - Ensure it only displays products selected for the team
  - Clearly show commission/bonus values for the member's specific role

### 5. Data and State Management

#### Update Store Functions
- Refine functions in `client/src/lib/incentiveStore.ts`:
  - Ensure `getAvailableProductsForSalesMember` correctly returns all team products
  - Update any functions that might suggest role-specific product access
  - Make sure incentive calculations work correctly across roles

#### Update API Endpoints
- Review `server/routes.ts`:
  - Ensure product assignment endpoints work on a team-wide basis
  - Verify role-specific incentive values are properly stored

### 6. Testing and Quality Assurance

#### Test Role Management
- Verify role creation, editing, and deletion with constraints
- Test default role assignment logic when a default role is deleted
- Confirm prevention of deleting the last role

#### Test Product Selection and Visibility
- Verify products can be selected/deselected for the team
- Test that all roles see the same selected products
- Confirm role-specific incentive values are displayed correctly

#### Test Member Management
- Verify members always have exactly one role
- Test role assignment and changes

### 7. Documentation Updates

#### Code Comments and Documentation
- Update comments throughout the codebase to reflect correct behavior
- Document key functions with JSDoc comments
- Add README sections explaining the role-incentive-product relationship

#### User Documentation
- Create user guides for both admin and member roles
- Document the product selection process
- Explain the incentive structure and role collaboration