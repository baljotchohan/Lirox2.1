import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile } from '../types';

// WARNING: The API key is embedded in the client bundle via Vite's define config.
// For production, proxy Gemini calls through a backend endpoint to keep the key secret.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithLirox(message: string, profile: UserProfile, history: Array<{ role: string; content: string }>) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are Lirox, a personal AI that deeply understands the user.

Current User Profile:
- Roles: ${profile.roles?.join(', ') || 'Unknown'}
- Interests: ${profile.interests?.join(', ') || 'Unknown'}
- Goals: ${profile.goals?.join(', ') || 'Unknown'}
- Challenges: ${profile.pain_points?.join(', ') || 'Unknown'}

Your approach:
1. Remember everything about this person.
2. Reference past conversations when relevant.
3. Provide personalized insights.
4. Ask clarifying questions to understand them better.
5. Be warm, helpful, and genuinely interested.

Keep responses concise but thoughtful.`;

  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
    }
  });

  return response.text;
}

export async function extractProfileFacts(userMsg: string, assistantResponse: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Extract facts about the user from this conversation:

User: "${userMsg}"
Assistant: "${assistantResponse}"

Return ONLY valid JSON (no markdown, no explanation):
{
  "roles": ["role1"],
  "interests": ["interest1"],
  "goals": ["goal1"],
  "pain_points": ["pain1"],
  "preferences": {}
}

Include only explicitly stated facts. Return empty arrays for categories with no info.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roles: { type: Type.ARRAY, items: { type: Type.STRING } },
          interests: { type: Type.ARRAY, items: { type: Type.STRING } },
          goals: { type: Type.ARRAY, items: { type: Type.STRING } },
          pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          preferences: { type: Type.OBJECT }
        },
        required: ["roles", "interests", "goals", "pain_points", "preferences"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse profile facts", e);
    return null;
  }
}
