import { useState, useEffect, useRef } from "react";
import { Menu, Settings, Brain, Code, Calculator, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/file-upload";
import Message from "@/components/message";
import { ConversationMode, AIModel, availableModels } from "@shared/schema";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  currentMode: ConversationMode;
  selectedModel: AIModel | "auto";
  onModelChange: (model: AIModel | "auto") => void;
  onMobileMenuToggle: () => void;
}

const capabilityCards = [
  {
    title: "Reasoning & Logic",
    description: "Complex problem solving",
    icon: Brain,
    color: "hover:border-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    title: "Code Generation", 
    description: "Programming assistance",
    icon: Code,
    color: "hover:border-green-500",
    bgColor: "bg-green-500",
  },
  {
    title: "Mathematics",
    description: "Advanced calculations", 
    icon: Calculator,
    color: "hover:border-orange-500",
    bgColor: "bg-orange-500",
  },
  {
    title: "File Analysis",
    description: "Image & PDF processing",
    icon: Search,
    color: "hover:border-purple-500",
    bgColor: "bg-purple-500",
  },
];

const examplePrompts = [
  "Solve: x² + 5x + 6 = 0",
  "Write a sorting algorithm in Python",
  "Analyze this image for me",
  "Explain quantum computing basics",
];

const modelDisplayNames: Record<AIModel | "auto", string> = {
  "auto": "Auto-Select",
  "claude-sonnet-4": "Claude Sonnet 4",
  "gpt-4.1": "GPT 4.1",
  "gemini-2.5-pro-preview-06-05": "Gemini 2.5 Pro",
  "gpt-4o-mini": "GPT 4o Mini",
  "o4-mini-medium": "O4 Mini Medium",
  "o3-medium": "O3 Medium",
  "o4-mini": "O4 Mini",
  "r1-1776": "R1-1776",
  "claude-3.5-haiku": "Claude 3.5 Haiku",
  "claude-2": "Claude 2",
  "claude-opus-4": "Claude Opus 4",
  "gpt-4.1-nano": "GPT 4.1 Nano",
  "grok-3": "Grok 3",
  "command-r": "Command R",
  "pixtral-12b": "Pixtral 12B",
  "deepseek-r1-0528": "DeepSeek R1",
};

const modePlaceholders: Record<ConversationMode, string> = {
  general: "Message Shivaay AI...",
  friend: "Chat with your AI friend...",
  shayar: "Ask for poetry or creative writing...",
  search: "What would you like to research?...",
  coding: "Describe your programming problem...",
  math: "Enter your mathematical problem...",
  image: "Describe the image you want to create...",
};

export default function ChatArea({ 
  currentMode, 
  selectedModel, 
  onModelChange,
  onMobileMenuToggle 
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isLoading } = useChat(currentMode, selectedModel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    
    await sendMessage(input, attachedFiles);
    setInput("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="lg:ml-80 flex flex-col h-screen">
      {/* Top Bar */}
      <header className="bg-dark-secondary border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="lg:hidden p-2 hover:bg-gray-700"
              onClick={onMobileMenuToggle}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Chat Assistant</h2>
                <p className="text-sm text-muted">
                  Current Model: {modelDisplayNames[selectedModel]}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-48 bg-dark-tertiary border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-tertiary border-gray-600">
                <SelectItem value="auto">Auto-Select</SelectItem>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {modelDisplayNames[model]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-700">
              <Settings className="w-5 h-5 text-muted" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {showWelcome ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to Shivaay AI!</h1>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                I'm your fully offline, privacy-focused AI assistant. I can help you with reasoning, coding, mathematics, web search, file analysis, and much more!
              </p>
            </div>

            {/* Capability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
              {capabilityCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "bg-dark-secondary p-6 rounded-xl border border-gray-700 transition-all duration-200 cursor-pointer",
                      card.color
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", card.bgColor)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-muted">{card.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Example Prompts */}
            <div className="flex flex-wrap gap-3 justify-center">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="bg-dark-tertiary hover:bg-gray-600 text-muted hover:text-white transition-all duration-200"
                  onClick={() => handleExampleClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-secondary border border-gray-700 rounded-xl px-4 py-3 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-purple-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <span className="text-muted text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* File Upload & Input */}
        <div className="border-t border-gray-700 bg-dark-secondary">
          <FileUpload
            attachedFiles={attachedFiles}
            onFilesChange={setAttachedFiles}
          />
          
          <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={modePlaceholders[currentMode]}
                    className="bg-dark-tertiary border-gray-600 text-white placeholder-muted resize-none focus:ring-2 focus:ring-purple-primary focus:border-transparent pr-12"
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-primary hover:bg-purple-600 p-2"
                    size="sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted mt-2 text-center">
                Shivaay AI can make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
