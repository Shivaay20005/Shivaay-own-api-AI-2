import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConversationMode, AIModel, Message } from "@shared/schema";
import { sendChatMessage, getConversationHistory } from "@/lib/api";
import { fileToBase64 } from "@/lib/file-utils";

export function useChat(mode: ConversationMode, model: AIModel | "auto") {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMessageRef = useRef<string>("");
  const currentStreamingId = useRef<number | null>(null);
  const previousMode = useRef<ConversationMode>(mode);
  const queryClient = useQueryClient();

  // Clear messages when mode changes
  useEffect(() => {
    if (previousMode.current !== mode) {
      setMessages([]);
      currentStreamingId.current = null;
      streamingMessageRef.current = "";
      previousMode.current = mode;
    }
  }, [mode]);

  // Load conversation history
  const { data: history } = useQuery({
    queryKey: ["/api/conversations", mode],
    queryFn: () => getConversationHistory(mode),
    enabled: true,
  });

  // Streaming chat implementation
  const sendStreamingMessage = useCallback(async (message: string, files: File[]) => {
    if (!message.trim() && files.length === 0) return;
    
    setIsStreaming(true);
    streamingMessageRef.current = "";
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now(),
      conversationId: null,
      role: "user",
      content: message,
      files: files.length > 0 ? files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
      })) : null,
      model: null,
      createdAt: new Date(),
    };

    // Create initial assistant message for streaming
    const assistantId = Date.now() + 1;
    currentStreamingId.current = assistantId;
    
    const initialAssistantMessage: Message = {
      id: assistantId,
      conversationId: null,
      role: "assistant",
      content: "",
      files: null,
      model: model === "auto" ? "Selecting best model..." : model,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);

    try {
      // Call the API with streaming
      const response = await sendChatMessage(message, files, model, mode);
      
      // Simulate streaming effect for better UX
      const fullResponse = response.message;
      const words = fullResponse.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        if (currentStreamingId.current !== assistantId) break; // Check if still current
        
        const currentContent = words.slice(0, i + 1).join(' ');
        streamingMessageRef.current = currentContent;
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, content: currentContent, model: response.model }
            : msg
        ));
        
        // Add delay for streaming effect
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      // Final update
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { ...msg, content: fullResponse, model: response.model }
          : msg
      ));
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { 
              ...msg, 
              content: "Sorry, I encountered an error processing your request. Please try again.",
              model: "Error"
            }
          : msg
      ));
    } finally {
      setIsStreaming(false);
      currentStreamingId.current = null;
    }
  }, [model, mode]);

  // Legacy mutation for backward compatibility
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, files }: { message: string; files: File[] }) => {
      await sendStreamingMessage(message, files);
      return { message: "Sent", model: model };
    },
  });

  const sendMessage = useCallback(async (message: string, files: File[]) => {
    await sendStreamingMessage(message, files);
  }, [sendStreamingMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    currentStreamingId.current = null;
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading: isStreaming,
    error: sendMessageMutation.error,
  };
}
