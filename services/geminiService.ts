
import { GoogleGenAI } from "@google/genai";
import { FUUAST_KNOWLEDGE_BASE } from "../knowledgeBase";
import { KnowledgeEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Mocks the Python backend processing:
 * 1. Simple keyword-based semantic filtering (simulating cosine similarity)
 * 2. Context extraction
 */
const retrieveContext = (query: string): KnowledgeEntry[] => {
  const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  // Scoring entries based on keyword matches
  const scoredEntries = FUUAST_KNOWLEDGE_BASE.map(entry => {
    let score = 0;
    const content = entry.content.toLowerCase();
    const category = entry.category.toLowerCase();
    
    words.forEach(word => {
      if (content.includes(word)) score += 1;
      if (category.includes(word)) score += 2; // Category matches weight more
    });
    
    return { ...entry, score };
  });

  // Sort and filter top matches
  return scoredEntries
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const generateAcademicResponse = async (userQuery: string) => {
  const contextEntries = retrieveContext(userQuery);
  
  if (contextEntries.length === 0) {
    return {
      text: "I’m sorry, this information is not available in the official university records I have access to.",
      sources: []
    };
  }

  const contextText = contextEntries
    .map(e => `[Source: ${e.sourceDocument}, Page ${e.pageNumber}] Content: ${e.content}`)
    .join('\n\n');

  const systemPrompt = `
    You are an AI-powered academic assistant for Federal Urdu University of Arts, Science & Technology (FUUAST), Gulshan Campus.
    
    SYSTEM ROLE:
    Official, factual, and document-grounded university information assistant.
    Answer strictly using the provided context.
    Do not invent information.
    Tone: Clear, Formal, Neutral Academic.
    No emojis, no jokes, no casual language.

    CITATION REQUIREMENT:
    Every factual answer MUST end with a citation in this format: (Source: <Document Name>, Page <Page Number>).
    If multiple entries are used, list all sources clearly.

    CONTEXT PROVIDED:
    ${contextText}

    USER QUERY:
    ${userQuery}

    If the query cannot be answered by the context, respond ONLY with: 
    “I’m sorry, this information is not available in the official university records I have access to.”
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
      config: {
        temperature: 0.1, // Keep it deterministic
        topK: 1,
        topP: 0.1,
      },
    });

    return {
      text: response.text || "I apologize, an internal error occurred while processing the institutional records.",
      sources: contextEntries.map(e => `${e.sourceDocument} (Page ${e.pageNumber})`)
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "A technical error occurred. Please contact the university helpdesk for official support.",
      sources: []
    };
  }
};
