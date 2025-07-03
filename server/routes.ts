import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg', 
      'image/jpg',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// Chat request schema
const chatRequestSchema = z.object({
  message: z.string(),
  model: z.string(),
  mode: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", upload.any(), async (req, res) => {
    try {
      const { message, model, mode } = chatRequestSchema.parse(req.body);
      const files = req.files as Express.Multer.File[] || [];
      
      // Process files
      const processedFiles = await Promise.all(files.map(async (file) => {
        let extractedText = "";
        
        if (file.mimetype === 'application/pdf') {
          // Extract text from PDF
          extractedText = await storage.extractPDFText(file.buffer);
        }
        
        return {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          data: file.buffer.toString('base64'),
          extractedText
        };
      }));

      // Build context based on mode
      let contextPrompt = "";
      switch (mode) {
        case "friend":
          contextPrompt = "You are a friendly, casual AI assistant. Respond in a warm, conversational tone with humor and empathy.";
          break;
        case "search":
          contextPrompt = "You are a research assistant with real-time web search capabilities. You can access current information from the internet. Provide detailed, well-researched information with sources and real-time data. When possible, include current events, latest updates, and fact-checked information.";
          break;
        case "coding":
          contextPrompt = "You are a programming expert. Provide code examples, explanations, debugging help, and best practices.";
          break;
        case "math":
          contextPrompt = "You are a mathematics expert. Solve problems step-by-step with clear explanations and show your work.";
          break;
        case "codesearch":
          contextPrompt = "You are a specialized programming search assistant. Help find code solutions, libraries, frameworks, and programming resources.";
          break;
        case "procoder":
          contextPrompt = "You are ShivaayPro Coder, an elite programming expert. Provide advanced solutions, optimizations, and enterprise-level coding practices.";
          break;
        case "image":
          contextPrompt = "You are an AI art creator. Help with image generation prompts, creative descriptions, and visual concepts.";
          break;

        default:
          contextPrompt = "You are Shivaay AI, a helpful and intelligent assistant.";
      }

      // Add file analysis context if files are present
      if (processedFiles.length > 0) {
        const fileDescriptions = processedFiles.map(file => {
          if (file.type.startsWith('image/')) {
            return `Image: ${file.name} (${file.type})`;
          } else if (file.type === 'application/pdf') {
            return `PDF: ${file.name} - Content: ${file.extractedText.substring(0, 500)}...`;
          }
          return `File: ${file.name} (${file.type})`;
        }).join('\n');
        
        contextPrompt += `\n\nUser has attached files:\n${fileDescriptions}`;
      }

      // For search mode, perform web search first
      let webSearchResults = "";
      if (mode === "search" || mode === "coding" || mode === "codesearch") {
        try {
          // Extract search terms from user message
          const searchTerms = message.replace(/[^\w\s]/gi, ' ').trim();
          if (searchTerms.length > 3) {
            webSearchResults = await storage.performWebSearch(searchTerms);
          }
        } catch (error) {
          console.error("Web search failed:", error);
          webSearchResults = "🌐 Web search temporarily unavailable.";
        }
      }

      // Combine context, web search results, and user message
      let fullMessage = `${contextPrompt}\n\n`;
      
      if (webSearchResults) {
        fullMessage += `${webSearchResults}\n\n`;
      }
      
      fullMessage += `User: ${message}`;

      // For deep search and coding modes, increase character limit to 10,000 lines
      const isDeepMode = mode === "search" || mode === "coding" || mode === "procoder" || mode === "codesearch";
      const maxLength = isDeepMode ? 50000 : 8000; // Higher limits for deep modes
      
      if (fullMessage.length > maxLength) {
        fullMessage = fullMessage.substring(0, maxLength) + "\n\n[Message truncated for processing]";
      }

      // Smart model selection based on mode and content
      let selectedModel = model;
      if (model === "auto") {
        switch (mode) {
          case "coding":
          case "procoder":
          case "codesearch":
            selectedModel = "deepseek-r1-0528"; // Best for coding
            break;
          case "math":
            selectedModel = "o3-medium"; // Best for mathematics
            break;
          case "search":
            selectedModel = "grok-3"; // Best for research
            break;

          case "image":
            selectedModel = "pixtral-12b"; // Best for visual tasks
            break;
          case "friend":
            selectedModel = "claude-3.5-haiku"; // Best for conversation
            break;
          default:
            selectedModel = "gpt-4o-mini"; // Good general purpose
        }
      }

      // Call A3Z API with selected model and mode
      const response = await storage.callA3ZAPI(fullMessage, selectedModel, mode);
      
      // Save message to storage
      await storage.saveMessage({
        conversationId: null, // For now, not using conversations
        role: "user",
        content: message,
        files: processedFiles.length > 0 ? processedFiles : null,
        model: null,
      });

      await storage.saveMessage({
        conversationId: null,
        role: "assistant", 
        content: response.message,
        files: null,
        model: response.model,
      });

      res.json(response);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        message: "Sorry, I encountered an error. Please try again."
      });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = await storage.saveFile({
        filename: `${Date.now()}_${req.file.originalname}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer.toString('base64'),
      });

      res.json({ 
        id: file.id,
        url: `/api/files/${file.id}` 
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Get conversation history
  app.get("/api/conversations/:mode", async (req, res) => {
    try {
      const { mode } = req.params;
      const messages = await storage.getMessagesByMode(mode);
      res.json(messages);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
