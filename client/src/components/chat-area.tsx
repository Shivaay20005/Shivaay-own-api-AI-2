import { useState, useEffect, useRef } from "react";
import { Menu, Settings, Brain, Code, Calculator, Search, Plus, MessageSquare, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/file-upload";
import Message from "@/components/message";
import AdminPanel from "@/components/admin-panel";
import { ConversationMode, AIModel, availableModels } from "@shared/schema";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/file-utils";
import VoiceButton from "@/components/voice-button";
import { useToast } from "@/hooks/use-toast";
import ScrollToTop from "@/components/scroll-to-top";

interface ChatAreaProps {
  currentMode: ConversationMode;
  selectedModel: AIModel | "auto";
  onModelChange: (model: AIModel | "auto") => void;
  onMobileMenuToggle: () => void;
  hackerModeEnabled: boolean;
  onToggleHackerMode: (enabled: boolean) => void;
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
  "Solve: x² + 5x + 6 = 0",
  "Write a sorting algorithm in Python",
  "Analyze this image for me",
  "Explain quantum computing basics",
];

const modelDisplayNames: Record<AIModel | "auto", string> = {
  "auto": "Auto-Select Best Model",
  "gpt-4o-mini": "Quick Response",
  "claude-3.5-haiku": "Creative Writer", 
  "claude-2": "Conversational AI",
  "gemini-1.5-flash": "Advanced Reasoning",
  "command-r": "Command Expert",
  "gpt-3.5-turbo": "Smart Helper",
  "llama-3.1-8b": "Efficient Assistant",
  "mistral-7b": "Fast Helper",
};

const modePlaceholders: Record<ConversationMode, string> = {
  general: "Ask me anything - I'll auto-select the best model...",
  friend: "Chat with your AI friend...",
  search: "What would you like to research?...",
  coding: "Describe your programming problem...",
  math: "Enter your mathematical problem...",
  codesearch: "Search for code solutions and resources...",
  procoder: "Advanced programming challenges...",
  image: "Describe the image you want to create...",
  hacker: "🔴 Enter your hacking query... No restrictions.",
};

export default function ChatArea({ 
  currentMode, 
  selectedModel, 
  onModelChange,
  onMobileMenuToggle,
  hackerModeEnabled,
  onToggleHackerMode
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

  // Voice functionality
  const handleVoiceTranscript = (transcript: string) => {
    setInput(prev => prev + (prev ? " " : "") + transcript);
  };

  const handleSpeakResponse = async (text: string) => {
    // This will be called when we want to speak AI responses
    if (window.shivaaySpeak) {
      window.shivaaySpeak(text);
    }
  };

  // Auto-speak the latest AI response when messages update
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && lastMessage.content) {
      // Only auto-speak if the message is recent (within last 2 seconds)
      const messageTime = lastMessage.createdAt ? new Date(lastMessage.createdAt).getTime() : Date.now();
      const now = Date.now();
      if (now - messageTime < 2000) {
        setTimeout(() => {
          handleSpeakResponse(lastMessage.content);
        }, 500); // Small delay to let the message render
      }
    }
  }, [messages]);

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="lg:ml-80 flex flex-col h-screen min-h-screen">
      {/* Top Bar */}
      <header className="bg-dark-secondary border-b border-gray-700 p-2 lg:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="lg:hidden p-2 hover:bg-gray-700"
              onClick={onMobileMenuToggle}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-lg flex items-center justify-center">
                <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-sm lg:text-base font-semibold text-white">Chat Assistant</h2>
                <p className="text-xs lg:text-sm text-muted hidden lg:block">
                  Current Model: {modelDisplayNames[selectedModel]}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 lg:space-x-4">
            
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-32 lg:w-48 bg-dark-tertiary border-gray-600 text-xs lg:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-tertiary border-gray-600">
                <SelectItem value="auto">Auto-Select Best Model</SelectItem>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {modelDisplayNames[model]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="text-xs text-muted hidden sm:block">
                {currentMode === "general" ? "Auto-Mode" : `${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`}
                {(currentMode === "search" || currentMode === "coding" || currentMode === "codesearch") && (
                  <span className="ml-1 text-green-400 text-xs">🌐</span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 lg:p-2 hover:bg-gray-700"
                onClick={() => setShowAdminPanel(true)}
              >
                <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-muted" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {showWelcome ? (
          <div className="flex-1 flex flex-col items-center justify-center mobile-welcome p-4 lg:p-8 max-w-6xl mx-auto w-full">
            <div className="text-center mb-6 lg:mb-12">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Brain className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 lg:mb-4">Welcome to Shivaay AI!</h1>
              <p className="text-sm lg:text-lg text-muted max-w-2xl mx-auto px-4">
                Your AI assistant with web search, coding help, and file analysis
              </p>
            </div>

            {/* Capability Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 w-full mb-6 lg:mb-12">
              {capabilityCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "bg-dark-secondary p-3 lg:p-6 rounded-xl border border-gray-700 transition-all duration-200 cursor-pointer",
                      card.color
                    )}
                  >
                    <div className={cn("w-8 h-8 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-2 lg:mb-4", card.bgColor)}>
                      <Icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <h3 className="text-sm lg:text-base font-semibold text-white mb-1 lg:mb-2">{card.title}</h3>
                    <p className="text-xs lg:text-sm text-muted">{card.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Example Prompts */}
            <div className="flex flex-wrap gap-2 lg:gap-3 justify-center px-4">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="bg-dark-tertiary hover:bg-gray-600 text-muted hover:text-white transition-all duration-200 text-xs lg:text-sm p-2 lg:p-3"
                  onClick={() => handleExampleClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto smooth-scroll mobile-messages mobile-scroll p-2 sm:p-3 lg:p-4 space-y-4">
            {messages.map((message) => (
              <Message 
                key={message.id} 
                message={message} 
                showModelName={showModelNames}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-secondary border border-gray-700 rounded-xl px-3 lg:px-4 py-2 lg:py-3 max-w-3xl">
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

        {/* Input Area with Integrated File Upload */}
        <div className="border-t border-gray-700 bg-transparent mobile-input-area">
          <div className="p-3 sm:p-4 lg:p-6 mobile-input-container">
            <div className="w-full max-w-4xl mx-auto">
              {/* Attached Files Display */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-dark-tertiary px-3 py-1.5 rounded-full text-sm">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white truncate max-w-[120px]">{file.name}</span>
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
              
              {/* Input Container */}
              <div className="relative">
                <div className="chat-input-container flex items-end space-x-2">
                  {/* File Upload Button */}
                  <div className="flex-shrink-0 p-1 sm:p-2">
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
                      className="p-1.5 sm:p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white"
                    >
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                  
                  {/* Text Input */}
                  <div className="flex-1 min-w-0">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={modePlaceholders[currentMode]}
                      className="chat-input-textarea mobile-input-field min-h-[40px] max-h-[120px] py-2 sm:py-3 px-2 bg-transparent border-none outline-none resize-none focus:outline-none focus:ring-0 text-white placeholder-gray-400"
                      rows={1}
                    />
                  </div>
                  
                  {/* Voice Button */}
                  <div className="flex-shrink-0 p-1 sm:p-2">
                    <VoiceButton
                      onTranscript={handleVoiceTranscript}
                      onSpeakResponse={handleSpeakResponse}
                      disabled={isLoading}
                      className="hover:bg-gray-600"
                    />
                  </div>
                  
                  {/* Send Button */}
                  <div className="flex-shrink-0 p-1 sm:p-2">
                    <Button
                      onClick={handleSend}
                      disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                      className="bg-purple-primary hover:bg-purple-600 disabled:bg-gray-600 p-1.5 sm:p-2 rounded-lg transition-colors"
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
                  {("webkitSpeechRecognition" in window || "SpeechRecognition" in window) && (
                    <span className="hidden lg:inline">🎤 Voice Input</span>
                  )}
                </div>
                <span className="hidden lg:inline">Shivaay AI can make mistakes. Verify important information.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Panel */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        showModelNames={showModelNames}
        onToggleModelNames={setShowModelNames}
        hackerModeEnabled={hackerModeEnabled}
        onToggleHackerMode={onToggleHackerMode}
      />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
