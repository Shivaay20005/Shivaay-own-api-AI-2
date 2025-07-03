import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConversationMode, AIModel, Message } from "@shared/schema";
import { sendChatMessage, getConversationHistory } from "@/lib/api";
import { fileToBase64 } from "@/lib/file-utils";

export function useChat(mode: ConversationMode, model: AIModel | "auto") {
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  // Load conversation history
  const { data: history } = useQuery({
    queryKey: ["/api/conversations", mode],
    queryFn: () => getConversationHistory(mode),
    enabled: true,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, files }: { message: string; files: File[] }) => {
      return sendChatMessage(message, files, model, mode);
    },
    onSuccess: (response, variables) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        conversationId: null,
        role: "user",
        content: variables.message,
        files: variables.files.length > 0 ? variables.files.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
        })) : null,
        model: null,
        createdAt: new Date(),
      };

      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now() + 1,
        conversationId: null,
        role: "assistant",
        content: response.message,
        files: null,
        model: response.model,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now(),
        conversationId: null,
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        files: null,
        model: null,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const sendMessage = useCallback(async (message: string, files: File[]) => {
    if (!message.trim() && files.length === 0) return;

    sendMessageMutation.mutate({ message, files });
  }, [sendMessageMutation]);

  return {
    messages,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}
