
import { GoogleGenAI, Type } from "@google/genai";
import { DeepDiveData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const decodeBullet = async (bulletText: string): Promise<DeepDiveData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following resume bullet point and expand it into a detailed interview preparation guide. 
    
    Bullet Point: "${bulletText}"
    
    Provide:
    1. A STAR method expansion (Situation, Task, Action, Result).
    2. 2-3 potential KPIs/Metrics related to this work.
    3. 3 specific follow-up questions an interviewer might ask.
    4. A first-person storytelling narrative that provides "behind the scenes" context.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bullet: { type: Type.STRING },
          star: {
            type: Type.OBJECT,
            properties: {
              situation: { type: Type.STRING },
              task: { type: Type.STRING },
              action: { type: Type.STRING },
              result: { type: Type.STRING },
            },
            required: ["situation", "task", "action", "result"]
          },
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                label: { type: Type.STRING }
              },
              required: ["value", "label"]
            }
          },
          questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          narrative: { type: Type.STRING }
        },
        required: ["bullet", "star", "metrics", "questions", "narrative"]
      }
    }
  });

  return JSON.parse(response.text);
};
