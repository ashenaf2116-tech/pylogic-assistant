import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey! });

export interface PythonReference {
  title: string;
  description: string;
  code: string;
  category: string;
}

export async function translateToPython(prompt: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `You are a Python expert. Translate the following natural language request into clean, efficient, and well-commented Python code. 
            Provide ONLY the code block. If the request is not clear, provide the most likely implementation.
            
            Request: "${prompt}"`,
          },
        ],
      },
    ],
  });

  return response.text || "Sorry, I couldn't generate the code.";
}

export async function getPythonReference(topic: string): Promise<PythonReference> {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `Provide a concise Python reference for the topic: "${topic}". 
            Include a title, a short description, a practical code example, and a category.
            Return the result in JSON format.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          code: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ["title", "description", "code", "category"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      title: topic,
      description: "Error fetching reference.",
      code: "# No code available",
      category: "General",
    };
  }
}
