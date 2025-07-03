import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
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

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type File = typeof files.$inferSelect;

// API Types - Updated to match A3Z API available models
export const availableModels = [
  "gpt-4o-mini",
  "claude-3.5-haiku",
  "claude-2",
  "gemini-1.5-flash",
  "command-r",
  "gpt-3.5-turbo",
  "llama-3.1-8b",
  "mistral-7b"
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
  "image"
] as const;

export type ConversationMode = typeof conversationModes[number];
