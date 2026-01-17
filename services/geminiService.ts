
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, GroundingLink } from "../types";

class GeminiService {
  constructor() {}

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 21) return "Evening";
    return "Night";
  }

  async chatWithGrounding(history: Message[], message: string): Promise<{ text: string, links: GroundingLink[] }> {
    const ai = this.getAI();
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const timeContext = this.getTimeOfDay();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
          systemInstruction: `You are Brainora, a highly efficient and humble AI assistant.
          STRICT PERSONALITY RULES:
          1. NEVER repeat your name or "I am an AI" in every response. Be natural.
          2. Avoid over-confident or repetitive boilerplate phrases.
          3. Deliver intelligence directly. If a question is short, be concise.
          4. Adapt your tone to be helpful, professional, and understated.
          5. Use Google Search only when precision is needed for today's date (${new Date().toLocaleDateString()}).
          Context: ${timeContext}.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "I processed your request but couldn't find a specific text answer. Please try again.";
      const links: GroundingLink[] = [];
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri && chunk.web.title) {
            links.push({ uri: chunk.web.uri, title: chunk.web.title });
          }
        });
      }

      return { text, links };
    } catch (error) {
      console.error("Grounding error:", error);
      throw error;
    }
  }

  async *streamChat(history: Message[], message: string, mode: 'default' | 'knowledge' | 'search' | 'creative' | 'live' = 'default') {
    const ai = this.getAI();
    
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const instructions = {
      default: "You are Brainora. Answer efficiently. No repetitive introductions.",
      knowledge: "Deep analytical logic. Provide dense, smart information.",
      search: "Fact-check precision core. Focus purely on accurate data.",
      creative: "Imaginative synthesis core. Be vivid but avoid AI cliches.",
      live: "Live Pulse Intelligence. Integrate current events naturally."
    };

    try {
      const modelName = (mode === 'knowledge' || mode === 'live') ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const config: any = {
        systemInstruction: instructions[mode],
        temperature: 0.5, 
      };

      if (mode === 'live' || mode === 'search') {
        config.tools = [{ googleSearch: {} }];
      }

      if (mode === 'knowledge') {
        config.thinkingConfig = { thinkingBudget: 4000 };
      }

      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: contents,
        config: config,
      });
      
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error: any) {
      console.error("Streaming error:", error);
      yield "I encountered a minor core interruption. Please restate your query.";
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    const ai = this.getAI();
    try {
      // Force the model to understand this is an IMAGE task by using a more directive wrapper
      const optimizedPrompt = `IMAGE_GENERATION_TASK: Create a professional, detailed, and high-resolution 1K image of: ${prompt}. Ensure no distortion and a clean artistic finish. Output only the image data.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: optimizedPrompt }]
        },
        config: { 
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      console.warn("No inlineData found in image response, returning null.");
      return null;
    } catch (error) {
      console.error("Critical Image generation failed:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
