import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRoleDescription(roleName: string): Promise<string> {
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