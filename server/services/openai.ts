import OpenAI from "openai";

// Check if OpenAI API key is available
const apiKey = process.env.OPENAI_API_KEY;
const openaiEnabled = !!apiKey;

// Initialize OpenAI client only if API key is available
const openai = openaiEnabled ? new OpenAI({ apiKey }) : null as unknown as OpenAI;

export async function generateRoleDescription(roleName: string): Promise<string> {
  // Return default description if OpenAI is not available
  if (!openaiEnabled || !openai) {
    return `Responsible for ${roleName.toLowerCase()} activities within the sales organization.`;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that generates concise, professional descriptions for sales team roles."
        },
        {
          role: "user",
          content: `Generate a brief professional description (2-3 sentences) for a sales team role titled "${roleName}". The description should explain the key responsibilities and importance of this role in a sales organization. Keep it under 150 characters and focus on business value.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
      `Responsible for ${roleName.toLowerCase()} activities within the sales organization.`;
  } catch (error) {
    console.error("Error generating role description:", error);
    return `Responsible for ${roleName.toLowerCase()} activities within the sales organization.`;
  }
}

export interface RoleRecommendation {
  title: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  relevanceScore: number;
}

export async function getTeamStructureRecommendations(
  businessDescription: string,
  existingRoles: string[] = [],
  targetMarket: string = "general",
  salesGoals: string = "growth"
): Promise<RoleRecommendation[]> {
  // Default recommendations if OpenAI is not available
  const defaultRecommendations = [
    {
      title: "Sales Representative",
      description: "Handles direct sales activities with customers to meet sales targets and grow the business.",
      responsibilities: ["Engaging with potential customers", "Demonstrating products/services", "Closing sales", "Maintaining customer relationships"],
      requiredSkills: ["Communication", "Negotiation", "Product knowledge", "Customer service"],
      relevanceScore: 90
    },
    {
      title: "Sales Manager",
      description: "Oversees the sales team, sets targets, and develops strategies to maximize revenue and market penetration.",
      responsibilities: ["Managing sales team", "Setting sales targets", "Developing sales strategies", "Analyzing sales data"],
      requiredSkills: ["Leadership", "Strategic planning", "Sales forecasting", "Team management"],
      relevanceScore: 85
    },
    {
      title: "Account Executive",
      description: "Manages relationships with key accounts and identifies opportunities for upselling and cross-selling.",
      responsibilities: ["Managing key client relationships", "Identifying growth opportunities", "Negotiating contracts", "Strategic account planning"],
      requiredSkills: ["Relationship building", "Strategic thinking", "Negotiation", "Business acumen"],
      relevanceScore: 80
    }
  ];
  
  // Return default recommendations if OpenAI is not available
  if (!openaiEnabled || !openai) {
    return defaultRecommendations;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sales team structure expert that helps businesses optimize their sales organization. 
          Provide intelligent recommendations based on the business type, existing roles, target market, and sales goals.
          Focus on creating an effective and efficient sales organization structure.`
        },
        {
          role: "user",
          content: `Based on the following information, recommend the ideal sales team structure with specific roles:
          
          Business Description: ${businessDescription}
          Existing Roles: ${existingRoles.join(", ") || "None provided"}
          Target Market: ${targetMarket}
          Sales Goals: ${salesGoals}
          
          For each recommended role, provide:
          1. Role title
          2. Brief description (under 150 characters)
          3. 3-4 key responsibilities
          4. 3-4 required skills
          5. Relevance score (1-100) showing how important this role is for this specific business
          
          If some existing roles should be retained, include them with suggestions for optimization.
          If certain roles should be merged or split, provide that guidance.
          Format your response as a valid JSON array of role objects.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const parsed = JSON.parse(content);
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid response format");
    }

    return parsed.recommendations as RoleRecommendation[];
  } catch (error) {
    console.error("Error generating role recommendations:", error);
    return defaultRecommendations;
  }
}

// Permissions system has been removed
export async function generateRolePermissions(
  roleName: string,
  roleDescription: string
): Promise<string[]> {
  // Always return an empty array as permissions are no longer used
  return [];
}