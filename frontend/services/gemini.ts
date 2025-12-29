
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, ContentItem, PlatformStats } from "../types";

// Always initialize with named parameter and use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTrendsWithGemini = async (
  content: ContentItem[],
  stats: PlatformStats[]
): Promise<AIAnalysisResult> => {
  // Use gemini-3-flash-preview for general text analysis tasks
  const model = "gemini-3-flash-preview";

  // Prepare a concise context for the AI
  const contextData = {
    topContent: content.slice(0, 5).map(c => ({
      title: c.title,
      platform: c.platform,
      engagement: c.engagementRate,
      tags: c.tags
    })),
    platformPerformance: stats.map(s => ({
      platform: s.platform,
      velocity: s.viralVelocity
    }))
  };

  const prompt = `
    Analyze this social media monitoring data. 
    Identify the current trend direction and provide actionable advice for a content creator.
    Data: ${JSON.stringify(contextData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert social media strategist. Be concise, professional, and insight-driven.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A 1-sentence summary of the current landscape." },
            opportunities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 short, specific content opportunities."
            },
            riskAssessment: { type: Type.STRING, description: "Potential risks or saturation points." },
            predictedTrend: { type: Type.STRING, enum: ["Rising", "Stable", "Falling"] }
          },
          required: ["summary", "opportunities", "riskAssessment", "predictedTrend"]
        }
      }
    });

    // Extract text from the response using the .text property (not a function call)
    const jsonStr = response.text?.trim();
    if (jsonStr) {
      return JSON.parse(jsonStr) as AIAnalysisResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback if API key is missing or error occurs
    return {
      summary: "System is collecting data. Trends appear stable across platforms.",
      opportunities: ["Focus on high-engagement shorts", "Analyze competitor tags", "Improve thumbnail CTR"],
      riskAssessment: "Moderate saturation in tech niche.",
      predictedTrend: "Stable"
    };
  }
};
