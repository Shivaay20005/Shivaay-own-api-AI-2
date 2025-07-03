import { 
  conversations, 
  messages, 
  files,
  type Conversation, 
  type Message, 
  type File as FileType,
  type InsertConversation, 
  type InsertMessage, 
  type InsertFile,
  type AIModel
} from "@shared/schema";

export interface IStorage {
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  
  // Messages
  saveMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  getMessagesByMode(mode: string): Promise<Message[]>;
  
  // Files
  saveFile(file: InsertFile): Promise<FileType>;
  getFile(id: number): Promise<FileType | undefined>;
  
  // External API
  callA3ZAPI(message: string, model: string, mode?: string): Promise<{ message: string; model: string }>;
  extractPDFText(buffer: Buffer): Promise<string>;
  performWebSearch(query: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private files: Map<number, FileType>;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentFileId: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.files = new Map();
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentFileId = 1;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      id,
      mode: insertConversation.mode || "general",
      title: insertConversation.title || null,
      createdAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async saveMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      id,
      conversationId: insertMessage.conversationId || null,
      role: insertMessage.role,
      content: insertMessage.content,
      files: insertMessage.files || null,
      model: insertMessage.model || null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getMessagesByMode(mode: string): Promise<Message[]> {
    // For now, return all messages since we're not using conversation context
    return Array.from(this.messages.values())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async saveFile(insertFile: InsertFile): Promise<FileType> {
    const id = this.currentFileId++;
    const file: FileType = {
      ...insertFile,
      id,
      createdAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: number): Promise<FileType | undefined> {
    return this.files.get(id);
  }

  async callA3ZAPI(message: string, model: string, mode?: string): Promise<{ message: string; model: string }> {
    try {
      const apiUrl = `https://api.a3z.workers.dev/?user=${encodeURIComponent(message)}&model=${encodeURIComponent(model)}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Mozilla/5.0 (compatible; ShivaayAI/1.0)',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        // Try to parse error response to get available models
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error === "Invalid Model" && errorData.available_models) {
            // If model is invalid, try with a default model
            const fallbackModel = errorData.available_models[0];
            console.log(`Retrying with fallback model: ${fallbackModel}`);
            return this.callA3ZAPI(message, fallbackModel);
          }
        } catch (parseError) {
          // Not JSON, continue with original error
        }
        
        throw new Error(`API request failed: ${response.status}`);
      }

      const responseText = await response.text();
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(responseText);
        
        // Check if it's the new JSON format
        if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].message) {
          return {
            message: jsonData.choices[0].message.content,
            model: jsonData.model || model,
          };
        }
        
        // Check if it's an error response
        if (jsonData.detail && jsonData.detail.error) {
          throw new Error(`API Error: ${jsonData.detail.error.message}`);
        }
        
        // Fallback to text content if JSON doesn't match expected format
        return {
          message: responseText.trim(),
          model: model,
        };
      } catch (parseError) {
        // If not JSON, treat as plain text response
        return {
          message: responseText.trim(),
          model: model,
        };
      }
    } catch (error) {
      console.error("A3Z API Error:", error);
      
      // Try a fallback with a known working model
      if (model !== "claude-sonnet-4") {
        console.log("Retrying with claude-sonnet-4");
        return this.callA3ZAPI(message, "claude-sonnet-4");
      }
      
      // If all fails, return a fallback response
      return {
        message: "I apologize, but I'm currently unable to process your request due to a technical issue. Please try again in a moment.",
        model: model,
      };
    }
  }

  async extractPDFText(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text || "[PDF content could not be extracted]";
    } catch (error) {
      console.error("PDF extraction error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `[Unable to extract PDF content: ${errorMessage}]`;
    }
  }

  async performWebSearch(query: string): Promise<string> {
    try {
      // Enhanced web search with real-time data
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Shivaay AI Assistant'
        }
      });

      if (!response.ok) {
        return `Web search unavailable. Query: ${query}`;
      }

      const data = await response.json();
      
      // Format search results for AI processing
      let searchResults = `🌐 Real-time web search results for: "${query}"\n\n`;
      
      if (data.AbstractText) {
        searchResults += `📋 Summary: ${data.AbstractText}\n\n`;
      }
      
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        searchResults += "🔍 Related Information:\n";
        data.RelatedTopics.slice(0, 5).forEach((topic: any, index: number) => {
          if (topic.Text) {
            searchResults += `${index + 1}. ${topic.Text}\n`;
          }
        });
      }

      return searchResults || `No specific results found for: ${query}`;
    } catch (error) {
      console.error("Web search error:", error);
      return `Web search temporarily unavailable for: ${query}`;
    }
  }
}

export const storage = new MemStorage();
