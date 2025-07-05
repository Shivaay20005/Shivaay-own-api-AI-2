import { Message } from "@shared/schema";

export interface ConversationMemory {
  messages: Message[];
  context: string;
  lastUpdated: Date;
}

export class MemoryManager {
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private maxMessagesPerConversation = 20; // Keep last 20 messages for context
  private maxContextLength = 8000; // Maximum context length in characters

  // Get conversation memory key
  private getMemoryKey(userId: number, mode: string): string {
    return `${userId}-${mode}`;
  }

  // Add message to conversation memory
  addMessage(userId: number, mode: string, message: Message): void {
    const key = this.getMemoryKey(userId, mode);
    let memory = this.conversationMemories.get(key);

    if (!memory) {
      memory = {
        messages: [],
        context: "",
        lastUpdated: new Date()
      };
    }

    // Add new message
    memory.messages.push(message);

    // Trim messages if exceeding limit
    if (memory.messages.length > this.maxMessagesPerConversation) {
      memory.messages = memory.messages.slice(-this.maxMessagesPerConversation);
    }

    // Update context summary
    memory.context = this.generateContextSummary(memory.messages);
    memory.lastUpdated = new Date();

    this.conversationMemories.set(key, memory);
  }

  // Get conversation context for AI
  getConversationContext(userId: number, mode: string): Message[] {
    const key = this.getMemoryKey(userId, mode);
    const memory = this.conversationMemories.get(key);

    if (!memory || memory.messages.length === 0) {
      return [];
    }

    // Return recent messages for context
    return memory.messages.slice(-10); // Last 10 messages
  }

  // Generate context summary
  private generateContextSummary(messages: Message[]): string {
    if (messages.length === 0) return "";

    const recentMessages = messages.slice(-5);
    let summary = "Previous conversation context:\n";

    recentMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'User' : 'Shivaay';
      const content = msg.content.substring(0, 200); // Truncate long messages
      summary += `${role}: ${content}${msg.content.length > 200 ? '...' : ''}\n`;
    });

    return summary.length > this.maxContextLength 
      ? summary.substring(0, this.maxContextLength) + "..."
      : summary;
  }

  // Clear conversation memory
  clearConversation(userId: number, mode: string): void {
    const key = this.getMemoryKey(userId, mode);
    this.conversationMemories.delete(key);
  }

  // Get memory statistics
  getMemoryStats(): { 
    totalConversations: number; 
    totalMessages: number; 
    averageMessagesPerConversation: number 
  } {
    let totalMessages = 0;
    const totalConversations = this.conversationMemories.size;

    this.conversationMemories.forEach(memory => {
      totalMessages += memory.messages.length;
    });

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0 
        ? Math.round(totalMessages / totalConversations) 
        : 0
    };
  }

  // Clean old conversations (older than 24 hours)
  cleanOldMemories(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    this.conversationMemories.forEach((memory, key) => {
      if (memory.lastUpdated < oneDayAgo) {
        this.conversationMemories.delete(key);
      }
    });
  }

  // Export conversation for persistence
  exportConversation(userId: number, mode: string): ConversationMemory | null {
    const key = this.getMemoryKey(userId, mode);
    return this.conversationMemories.get(key) || null;
  }

  // Import conversation from persistence
  importConversation(userId: number, mode: string, memory: ConversationMemory): void {
    const key = this.getMemoryKey(userId, mode);
    this.conversationMemories.set(key, memory);
  }
}

// Global memory manager instance
export const memoryManager = new MemoryManager();

// Clean old memories every hour
setInterval(() => {
  memoryManager.cleanOldMemories();
}, 60 * 60 * 1000);