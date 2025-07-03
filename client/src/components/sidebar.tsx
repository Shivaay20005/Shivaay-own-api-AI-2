import { Brain, MessageCircle, Search, Code, Calculator, Image, Wrench, Zap } from "lucide-react";
import { ConversationMode } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  isMobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}

const conversationModes = [
  {
    id: "general" as ConversationMode,
    name: "Shivaay AI",
    description: "General assistant mode",
    icon: Brain,
    color: "bg-purple-primary",
  },
  {
    id: "friend" as ConversationMode,
    name: "Friend Talk",
    description: "Casual conversations",
    icon: MessageCircle,
    color: "bg-green-500",
  },
  {
    id: "search" as ConversationMode,
    name: "Deep Search",
    description: "Advanced research",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    id: "coding" as ConversationMode,
    name: "Deep Coding",
    description: "Programming help",
    icon: Code,
    color: "bg-indigo-500",
  },
  {
    id: "math" as ConversationMode,
    name: "Mathematics",
    description: "Problem solving",
    icon: Calculator,
    color: "bg-orange-500",
  },
  {
    id: "codesearch" as ConversationMode,
    name: "Code Search",
    description: "Programming queries",
    icon: Search,
    color: "bg-cyan-500",
  },
  {
    id: "procoder" as ConversationMode,
    name: "ShivaayPro Coder",
    description: "Ultimate debugging",
    icon: Zap,
    color: "bg-red-500",
  },
  {
    id: "image" as ConversationMode,
    name: "Image Generation",
    description: "AI art creation",
    icon: Image,
    color: "bg-teal-500",
  },

];

export default function Sidebar({ currentMode, onModeChange, isMobileOpen, onMobileToggle }: SidebarProps) {
  return (
    <aside className={cn(
      "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-dark-secondary border-r border-gray-700 transform transition-transform duration-200 ease-in-out",
      isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Shivaay AI</h1>
              <p className="text-sm text-muted">Local Assistant</p>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted">Real-time Web Search</span>
            <span className="text-sm text-muted">•</span>
            <span className="text-sm text-muted">AI Auto-Select</span>
          </div>
        </div>

        {/* Conversation Modes */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Conversation Modes
          </h3>
          <div className="space-y-2">
            {conversationModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeChange(mode.id);
                    onMobileToggle(false);
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all duration-200",
                    isActive
                      ? "bg-purple-primary bg-opacity-20 border border-purple-primary"
                      : "bg-dark-tertiary hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", mode.color)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{mode.name}</h4>
                      <p className="text-sm text-muted">{mode.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
