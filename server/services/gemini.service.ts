import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});


export const askGemini = async (abstract: string, question: string) => {
  const prompt = `
    You are a medical researcher skilled in answering questions in a way that a non-scientist would understand.
    While explaining, make sure to explain concepts in a way a layperson would understand. Do not assume the
    user is familiar with the scientific concepts in the abstract.

    Return text only, if there are non data parts ignore them.
      
    Abstract: "${abstract}"
    
    Question: "${question}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
};
