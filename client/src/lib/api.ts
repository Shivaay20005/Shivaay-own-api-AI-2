import { apiRequest } from "./queryClient";
import { AIModel, ConversationMode } from "@shared/schema";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  files?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
  preview?: string;
}

export interface ChatResponse {
  message: string;
  model: string;
  error?: string;
}

export async function sendChatMessage(
  message: string,
  files: File[],
  model: AIModel | "auto",
  mode: ConversationMode
): Promise<ChatResponse> {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("model", model);
  formData.append("mode", mode);
  
  files.forEach((file, index) => {
    formData.append(`file_${index}`, file);
  });

  const response = await fetch("/api/chat", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function uploadFile(file: File): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest("POST", "/api/upload", formData);
  return response.json();
}

export async function getConversationHistory(mode: ConversationMode) {
  const response = await apiRequest("GET", `/api/conversations/${mode}`);
  return response.json();
}

export async function createConversation(mode: ConversationMode, title?: string) {
  const response = await apiRequest("POST", "/api/conversations", {
    mode,
    title,
  });
  return response.json();
}
