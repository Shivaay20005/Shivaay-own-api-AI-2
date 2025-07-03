import { useState, useEffect, useRef } from "react";
import { Menu, Settings, Brain, Code, Calculator, Search, Plus, MessageSquare, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Message from "@/components/message";
import AdminPanel from "@/components/admin-panel";
import { ConversationMode, AIModel, availableModels } from "@shared/schema";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/file-utils";

interface ChatAreaProps {
  currentMode: ConversationMode;
  selectedModel: AIModel | "auto";
  onModelChange: (model: AIModel | "auto") => void;
  onMobileMenuToggle: () => void;
}

const capabilityCards = [
  {
    title: "Smart Reasoning",
    description: "Auto-select best AI model",
    icon: Brain,
    color: "hover:border-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    title: "Code Expert", 
    description: "Programming & debugging",
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
    title: "Web Search",
    description: "Real-time research",
    icon: Search,
    color: "hover:border-purple-500",
    bgColor: "bg-purple-500",
  },
];

const examplePrompts = [
  "Explain quantum computing",
  "Write a Python function",
  "Solve this equation: x² + 5x + 6 = 0",
  "What's the weather like?",
];

const modePlaceholders = {
  general: "Ask me anything...",
  friend: "What's on your mind?",
  search: "What would you like to research?",
  coding: "Describe your coding challenge...",
  codesearch: "What code or solution are you looking for?",
  mathematics: "Enter your mathematical problem...",
  "shivaay-pro": "What advanced coding task can I help with?",
  "image-gen": "Describe the image you want to create...",
};

export default function ChatArea({ 
  currentMode, 
  selectedModel, 
  onModelChange,
  onMobileMenuToggle 
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showModelNames, setShowModelNames] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { messages, sendMessage, isLoading, clearMessages } = useChat(currentMode, selectedModel);

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        alert(validation.error);
      }
    });

    if (validFiles.length > 0) {
      setAttachedFiles([...attachedFiles, ...validFiles]);
    }
  };

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

  const handleAdminAuth = (password: string) => {
    if (password === "Shivaay20005") {
      setShowAdminPanel(false);
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-dark-primary relative">
      {/* Header - Fully Responsive */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-dark-secondary">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden text-white hover:bg-gray-700 p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-primary to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm sm:text-base font-bold">S</span>
            </div>
            <h1 className="text-white font-semibold text-base sm:text-lg lg:text-xl">
              {currentMode === "general" ? "Shivaay AI" : 
               currentMode === "friend" ? "Friend Talk" :
               currentMode === "search" ? "Deep Search" :
               currentMode === "coding" ? "Deep Coding" :
               currentMode === "codesearch" ? "Code Search" :
               currentMode === "shivaay-pro" ? "ShivaayPro Coder" :
               currentMode === "image-gen" ? "Image Generation" :
               currentMode === "mathematics" ? "Mathematics" : "Shivaay AI"}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-[90px] sm:w-[120px] lg:w-[140px] bg-dark-tertiary border-gray-600 text-white text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-gray-600">
              <SelectItem value="auto" className="text-white hover:bg-gray-700">Auto</SelectItem>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model} className="text-white hover:bg-gray-700">
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdminPanel(true)}
            className="text-white hover:bg-gray-700 p-2"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            <div className="text-center mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-white text-2xl sm:text-3xl font-bold">S</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
                Welcome to Shivaay AI
              </h2>
              <p className="text-muted text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                Your intelligent AI assistant with advanced capabilities across multiple domains
              </p>
            </div>

            {/* Capability Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full mb-6 sm:mb-8 lg:mb-12">
              {capabilityCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "bg-dark-secondary p-3 sm:p-4 lg:p-6 rounded-xl border border-gray-700 transition-all duration-200 cursor-pointer",
                      card.color
                    )}
                  >
                    <div className={cn("w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 lg:mb-4", card.bgColor)}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1 sm:mb-2">{card.title}</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-muted">{card.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Example Prompts - Responsive */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-4 max-w-3xl">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="bg-dark-tertiary hover:bg-gray-600 text-muted hover:text-white transition-all duration-200 text-xs sm:text-sm p-2 sm:p-3"
                  onClick={() => handleExampleClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <Message 
                key={message.id} 
                message={message} 
                showModelName={showModelNames}
              />
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

        {/* Input Area with Integrated File Upload - ChatGPT Style */}
        <div className="border-t border-gray-700 bg-dark-secondary">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="w-full max-w-4xl mx-auto">
              {/* Attached Files Display */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-dark-tertiary px-3 py-1.5 rounded-full text-sm border border-gray-600">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white truncate max-w-[120px] sm:max-w-[200px]">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFiles = [...attachedFiles];
                          newFiles.splice(index, 1);
                          setAttachedFiles(newFiles);
                        }}
                        className="p-0 h-auto text-gray-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Input Container - ChatGPT Style */}
              <div className="relative">
                <div className="flex items-end bg-dark-tertiary rounded-2xl border border-gray-600 focus-within:border-purple-primary focus-within:ring-1 focus-within:ring-purple-primary transition-all duration-200">
                  {/* File Upload Button */}
                  <div className="flex-shrink-0 p-2 sm:p-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 sm:p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                  
                  {/* Text Input */}
                  <div className="flex-1 min-w-0 py-2 sm:py-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={modePlaceholders[currentMode]}
                      className="bg-transparent border-0 text-white placeholder-muted resize-none focus:ring-0 focus:outline-none text-sm sm:text-base min-h-[40px] max-h-[150px] py-0 px-0 scrollbar-hide"
                      style={{ fontSize: '16px' }} // Prevents iOS zoom
                      rows={1}
                    />
                  </div>
                  
                  {/* Send Button */}
                  <div className="flex-shrink-0 p-2 sm:p-3">
                    <Button
                      onClick={handleSend}
                      disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                      className="bg-purple-primary hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed p-1.5 sm:p-2 rounded-lg transition-colors"
                      size="sm"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between text-xs text-muted mt-2 px-1">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="hidden sm:inline">Web Search</span>
                    <span className="sm:hidden">🌐</span>
                  </div>
                  <span className="hidden sm:inline">14 Models Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">
                    {input.length > 0 && `${input.length} chars`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        showModelNames={showModelNames}
        onToggleModelNames={setShowModelNames}
      />
    </div>
  );
}