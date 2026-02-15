
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

export const extractTextFromResumeFile = async (base64Data: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      {
        text: "Extract the text from this resume. Format it clearly as plain text. Use ALL CAPS for section headers. Use bullet points (starting with a dash '-') for experience details. Maintain the original structure and content exactly. If it's a DOCX or PDF, ensure the hierarchy is preserved.",
      },
    ],
  });

  return response.text || '';
};

export const extractTextFromUrl = async (url: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `I have a resume hosted at this URL: ${url}. Please retrieve the text content from this document. Format it with ALL CAPS headers and '-' bullet points for achievements. If you cannot access the URL directly, explain why.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || '';
};
