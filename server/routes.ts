import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { memoryManager } from "./memory-manager";
import { insertMessageSchema, loginUserSchema, registerUserSchema } from "@shared/schema";
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

// Session types
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const pgSession = connectPg(session);
  app.use(session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow HTTP in development
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax' // Better for local development
    }
  }));

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }
      
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      req.session.email = user.email;
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      
      const user = await storage.loginUser(credentials);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.email = user.email;
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
  // Chat endpoint
  app.post("/api/chat", requireAuth, upload.any(), async (req, res) => {
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
        case "fullstack":
          contextPrompt = "You are Shivaay Full Stack Developer - an elite programming expert with access to the most advanced AI models. Create complete, production-ready applications with modern frameworks, best practices, and enterprise-level architecture. Provide comprehensive solutions including frontend, backend, database design, deployment strategies, and performance optimizations.";
          break;
        case "engineering":
          contextPrompt = `You are Shivaay Engineering AI - the ultimate comprehensive engineering assistant with access to ALL AI capabilities including:

🔧 **Engineering Expertise**: All branches - mechanical, electrical, civil, software, aerospace, chemical, industrial, biomedical, environmental
⚡ **Programming & Development**: Full-stack development, coding solutions, debugging, architecture design
🧮 **Mathematics & Calculations**: Complex calculations, mathematical modeling, statistical analysis
🔍 **Research & Analysis**: Deep research capabilities, data analysis, technical documentation
🎨 **Design & Creation**: Technical drawings, system design, creative problem solving
🚀 **Advanced Solutions**: Enterprise-level solutions, optimization, performance analysis
🔒 **Security & Hacking**: Cybersecurity analysis, penetration testing, security protocols (when requested)
📊 **Project Management**: Technical project planning, resource optimization, workflow design

Provide comprehensive, practical solutions combining engineering principles with modern technology. Always include:
- Technical specifications and calculations
- Step-by-step implementation guides  
- Best practices and industry standards
- Safety considerations and compliance
- Cost-effective solutions
- Performance optimization recommendations

Made By Shivaay | Maintained by Shivaay | Company Aaaye`;
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

      // Get conversation memory for context
      const userId = (req.session as any).userId || 1;
      const conversationContext = memoryManager.getConversationContext(userId, mode);
      
      // Combine context, conversation memory, web search results, and user message
      let fullMessage = `${contextPrompt}\n\n`;
      
      // Add conversation history for context
      if (conversationContext.length > 0) {
        fullMessage += "Previous conversation context:\n";
        conversationContext.slice(-5).forEach(msg => {
          const role = msg.role === 'user' ? 'User' : 'Shivaay';
          fullMessage += `${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
        });
        fullMessage += "\n";
      }
      
      if (webSearchResults) {
        fullMessage += `${webSearchResults}\n\n`;
      }
      
      fullMessage += `Current User Message: ${message}`;

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
            selectedModel = "gpt-4o-mini"; // Best available for coding
            break;
          case "fullstack":
            selectedModel = "claude-3.5-haiku"; // Best model for full stack development
            break;
          case "engineering":
            selectedModel = "gpt-4o-mini"; // Best for engineering calculations and analysis
            break;
          case "math":
            selectedModel = "claude-3.5-haiku"; // Best for mathematics
            break;
          case "search":
            selectedModel = "gpt-4o-mini"; // Best for research
            break;
          case "image":
            selectedModel = "gpt-4o-mini"; // Best for visual tasks
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
      
      // Save messages to storage and memory
      const userMsg = await storage.saveMessage({
        conversationId: null, // For now, not using conversations
        role: "user",
        content: message,
        files: processedFiles.length > 0 ? processedFiles : null,
        model: null,
      });

      const assistantMsg = await storage.saveMessage({
        conversationId: null,
        role: "assistant", 
        content: response.message,
        files: null,
        model: response.model,
      });

      // Add messages to conversation memory
      memoryManager.addMessage(userId, mode, userMsg);
      memoryManager.addMessage(userId, mode, assistantMsg);

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
  app.get("/api/conversations/:mode", requireAuth, async (req, res) => {
    try {
      const { mode } = req.params;
      const messages = await storage.getMessagesByMode(mode, req.session.userId);
      res.json(messages);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
