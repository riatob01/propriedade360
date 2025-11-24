
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

export const runAIAssistant = async (prompt: string, history: ChatMessage[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fullPrompt = `
    Você é o "Analista IA" da plataforma PROPRIEDADE360, um assistente especialista em agronegócio. 
    Seu objetivo é fornecer insights e recomendações claras para ajudar produtores rurais a otimizar a gestão de suas fazendas.
    Responda de forma concisa e direta, usando uma linguagem profissional, mas acessível.
    
    Contexto da conversa anterior:
    ${history.map(msg => `${msg.role}: ${msg.text}`).join('\n')}

    Nova pergunta do usuário:
    ${prompt}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.";
  }
};
