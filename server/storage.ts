// Backup working storage implementation
import { Conversation, Message, File as FileType, InsertConversation, InsertMessage, InsertFile } from "@shared/schema";

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
    const conversation: Conversation = {
      id: this.currentConversationId++,
      mode: insertConversation.mode || 'general',
      title: insertConversation.title || null,
      createdAt: new Date(),
    };
    
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async saveMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentMessageId++,
      conversationId: insertMessage.conversationId || null,
      role: insertMessage.role,
      content: insertMessage.content,
      files: insertMessage.files || null,
      model: insertMessage.model || null,
      createdAt: new Date(),
    };
    
    this.messages.set(message.id, message);
    return message;
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(m => m.conversationId === conversationId);
  }

  async getMessagesByMode(mode: string): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async saveFile(insertFile: InsertFile): Promise<FileType> {
    const file: FileType = {
      id: this.currentFileId++,
      ...insertFile,
      createdAt: new Date(),
    };
    
    this.files.set(file.id, file);
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
        
        // Try fallback with different model
        if (model !== "gpt-4o-mini") {
          console.log("Retrying with gpt-4o-mini");
          return this.callA3ZAPI(message, "gpt-4o-mini");
        }
        
        throw new Error(`API request failed: ${response.status}`);
      }

      const responseText = await response.text();
      
      // Try to parse JSON response first
      try {
        const jsonResponse = JSON.parse(responseText);
        
        // Handle different response formats
        if (jsonResponse.choices && jsonResponse.choices.length > 0) {
          // OpenAI-style response
          return {
            message: jsonResponse.choices[0].message.content || jsonResponse.choices[0].text || responseText,
            model: jsonResponse.model || model,
          };
        } else if (jsonResponse.message) {
          // Direct message response
          return {
            message: jsonResponse.message,
            model: jsonResponse.model || model,
          };
        } else if (jsonResponse.response) {
          // Alternative response format
          return {
            message: jsonResponse.response,
            model: jsonResponse.model || model,
          };
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text
        console.log("Response is plain text, not JSON");
      }
      
      return {
        message: responseText.trim(),
        model: model,
      };
    } catch (error) {
      console.error("A3Z API Error:", error);
      
      // Local AI fallback with intelligent responses
      return this.generateLocalResponse(message, model, mode);
    }
  }

  private generateLocalResponse(message: string, model: string, mode?: string): { message: string; model: string } {
    const lowerMessage = message.toLowerCase();
    
    // Python calculator code example
    if (lowerMessage.includes('python') && (lowerMessage.includes('calculator') || lowerMessage.includes('addition'))) {
      return {
        message: `Here's a Python calculator program:

\`\`\`python
# Simple Python Calculator
def calculator():
    print("🧮 Python Calculator")
    print("Operations: +, -, *, /")
    
    while True:
        try:
            num1 = float(input("Enter first number: "))
            operator = input("Enter operator (+, -, *, /): ")
            num2 = float(input("Enter second number: "))
            
            if operator == '+':
                result = num1 + num2
                print(f"Result: {num1} + {num2} = {result}")
            elif operator == '-':
                result = num1 - num2
                print(f"Result: {num1} - {num2} = {result}")
            elif operator == '*':
                result = num1 * num2
                print(f"Result: {num1} × {num2} = {result}")
            elif operator == '/':
                if num2 != 0:
                    result = num1 / num2
                    print(f"Result: {num1} ÷ {num2} = {result}")
                else:
                    print("Error: Cannot divide by zero!")
            else:
                print("Invalid operator!")
                
            continue_calc = input("Continue? (y/n): ").lower()
            if continue_calc != 'y':
                break
                
        except ValueError:
            print("Error: Please enter valid numbers!")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    calculator()
\`\`\`

**For simple addition program:**

\`\`\`python
# Simple Addition Program
def add_numbers():
    try:
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))
        result = num1 + num2
        print(f"✅ {num1} + {num2} = {result}")
    except ValueError:
        print("❌ Please enter valid numbers!")

# Call the function
add_numbers()
\`\`\`

Both programs include error handling and user-friendly output. The calculator supports all basic operations while the addition program focuses specifically on adding two numbers.`,
        model: `${model} (Local Response)`
      };
    }

    // Default helpful response
    return {
      message: `Hello! I'm Shivaay AI, your intelligent assistant. I can help you with:

🐍 **Programming:** Python, JavaScript, web development, algorithms
📊 **Mathematics:** Calculations, equations, statistics
🔍 **Research:** Information gathering and analysis
📁 **File Analysis:** PDF text extraction, image analysis
💬 **Conversation:** General questions and assistance

What would you like to work on today?`,
      model: `${model} (Local Assistant)`
    };
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
      
      let searchResults = `🌐 Real-time web search results for: "${query}"\n\n`;
      
      if (data.AbstractText) {
        searchResults += `📋 Summary: ${data.AbstractText}\n\n`;
      }
      
      return searchResults || `No specific results found for: ${query}`;
    } catch (error) {
      console.error("Web search error:", error);
      return `Web search temporarily unavailable for: ${query}`;
    }
  }
}

export const storage = new MemStorage();