import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export interface AIResponse {
  message: string;
  model: string;
  provider: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// OpenAI Integration
export class OpenAIProvider {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async chat(messages: AIMessage[], model: string = 'gpt-4o'): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return {
        message: response.choices[0]?.message?.content || 'No response generated',
        model: model,
        provider: 'openai'
      };
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Gemini Integration
export class GeminiProvider {
  private client: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  async chat(messages: AIMessage[], model: string = 'gemini-2.0-flash-experimental'): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      
      const response = await this.client.models.generateContent({
        model: model,
        contents: prompt,
      });

      return {
        message: response.text || 'No response generated',
        model: model,
        provider: 'gemini'
      };
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error?.message || 'Unknown error'}`);
    }
  }
}

// DeepSeek Integration
export class DeepSeekProvider {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  async chat(messages: AIMessage[], model: string = 'deepseek-chat'): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        message: data.choices[0]?.message?.content || 'No response generated',
        model: model,
        provider: 'deepseek'
      };
    } catch (error: any) {
      throw new Error(`DeepSeek API error: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Blackbox AI Integration
export class BlackboxProvider {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  async chat(messages: AIMessage[], model: string = 'blackbox-ai'): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Blackbox AI API key not configured');
    }

    try {
      const prompt = messages.map(m => m.content).join('\n\n');
      
      const response = await fetch('https://api.blackbox.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error(`Blackbox AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        message: data.response || data.choices?.[0]?.message?.content || 'No response generated',
        model: model,
        provider: 'blackbox'
      };
    } catch (error: any) {
      throw new Error(`Blackbox AI API error: ${error?.message || 'Unknown error'}`);
    }
  }
}

// A3Z API (existing provider)
export class A3ZProvider {
  async chat(messages: AIMessage[], model: string): Promise<AIResponse> {
    try {
      const prompt = messages.map(m => m.content).join('\n\n');
      
      const response = await fetch('https://api.a3z.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        throw new Error(`A3Z API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        message: data.choices[0]?.message?.content || 'No response generated',
        model: model,
        provider: 'a3z'
      };
    } catch (error: any) {
      throw new Error(`A3Z API error: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Main AI Router
export class AIRouter {
  private openai: OpenAIProvider;
  private gemini: GeminiProvider;
  private deepseek: DeepSeekProvider;
  private blackbox: BlackboxProvider;
  private a3z: A3ZProvider;

  constructor(apiKeys: {
    openai?: string;
    gemini?: string;
    deepseek?: string;
    blackbox?: string;
  } = {}) {
    this.openai = new OpenAIProvider(apiKeys.openai);
    this.gemini = new GeminiProvider(apiKeys.gemini);
    this.deepseek = new DeepSeekProvider(apiKeys.deepseek);
    this.blackbox = new BlackboxProvider(apiKeys.blackbox);
    this.a3z = new A3ZProvider();
  }

  async chat(messages: AIMessage[], model: string): Promise<AIResponse> {
    // Determine provider based on model
    if (model.startsWith('gpt-') || model.includes('openai')) {
      return await this.openai.chat(messages, model);
    } else if (model.startsWith('gemini-')) {
      return await this.gemini.chat(messages, model);
    } else if (model.startsWith('deepseek-')) {
      return await this.deepseek.chat(messages, model);
    } else if (model.startsWith('blackbox-')) {
      return await this.blackbox.chat(messages, model);
    } else {
      // Default to A3Z for other models
      return await this.a3z.chat(messages, model);
    }
  }

  // Add Shivaay branding and RTMS protection
  addShivaayBranding(message: string, mode?: string): string {
    const signature = mode === 'hacker' 
      ? '\n\n---\n**@ShivaayHackerv** - *Made By Shivaay | Maintained by Shivaay | Company Aaaye*'
      : '\n\n---\n**@ShivaayAI** - *Made By Shivaay | Maintained by Shivaay | Company Aaaye*';
    
    return message + signature;
  }

  // RTMS Protection - Prevent model information disclosure
  protectModelInfo(message: string): string {
    // Replace any model information with Shivaay branding
    const protectedMessage = message
      .replace(/(?:gpt|claude|gemini|deepseek|blackbox|openai|anthropic|google)/gi, 'Shivaay')
      .replace(/(?:model|api|provider|service)\s*(?:information|details|name)/gi, 'Shivaay AI capabilities')
      .replace(/(?:I am|I'm)\s+(?:gpt|claude|gemini|deepseek|blackbox)/gi, 'I am Shivaay')
      .replace(/(?:created|developed|made)\s+by\s+(?:openai|anthropic|google|deepseek|blackbox)/gi, 'created by Shivaay');
    
    return protectedMessage;
  }
}