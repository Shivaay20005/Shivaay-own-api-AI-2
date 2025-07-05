import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  theme: text("theme").default("dark"), // dark, light
  preferredModel: text("preferred_model").default("auto"),
  // User API Keys
  openaiApiKey: text("openai_api_key"),
  geminiApiKey: text("gemini_api_key"),
  deepseekApiKey: text("deepseek_api_key"),
  blackboxApiKey: text("blackbox_api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mode: text("mode").notNull().default("general"),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  files: jsonb("files"), // Array of file data
  model: text("model"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(), // base64 encoded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin settings for system-wide API keys
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value"),
  description: text("description"),
  isSecret: boolean("is_secret").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("Valid email address required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUserSchema = z.object({
  email: z.string().email("Valid email address required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type User = typeof users.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type File = typeof files.$inferSelect;

// AI Providers and Models
export const aiProviders = [
  "a3z",
  "openai", 
  "gemini",
  "deepseek",
  "blackbox"
] as const;

export type AIProvider = typeof aiProviders[number];

// Updated models to include all providers
export const availableModels = [
  // A3Z API Models  
  "gpt-4o-mini",
  "claude-3.5-haiku", 
  "claude-2",
  "gemini-1.5-flash",
  "command-r",
  "gpt-3.5-turbo",
  "llama-3.1-8b",
  "mistral-7b",
  // OpenAI Models
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo-16k",
  // Gemini Models
  "gemini-2.0-flash-experimental",
  "gemini-1.5-pro",
  "gemini-1.5-flash-002",
  // DeepSeek Models  
  "deepseek-chat",
  "deepseek-coder",
  // Blackbox AI Models
  "blackbox-ai",
  "blackbox-code"
] as const;

export type AIModel = typeof availableModels[number];

export const conversationModes = [
  "general",
  "friend", 
  "search",
  "coding",
  "math",
  "codesearch",
  "procoder", 
  "image",
  "hacker",
  "fullstack" // Admin-only mode
] as const;

export type ConversationMode = typeof conversationModes[number];
