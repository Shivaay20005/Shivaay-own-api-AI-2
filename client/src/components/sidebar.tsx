import { Brain, MessageCircle, Search, Code, Calculator, Image, Wrench, Zap, User, LogOut, Skull, Settings } from "lucide-react";
import { ConversationMode } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import SidebarScrollIndicator from "@/components/sidebar-scroll-indicator";

interface SidebarProps {
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  isMobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
  hackerModeEnabled?: boolean;
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
  {
    id: "engineering" as ConversationMode,
    name: "Engineering",
    description: "Technical engineering solutions",
    icon: Settings,
    color: "bg-yellow-500",
  },
];

const hackerMode = {
  id: "hacker" as ConversationMode,
  name: "🔴 Dark GPT",
  description: "Unrestricted mode",
  icon: Skull,
  color: "bg-red-600",
};

export default function Sidebar({ currentMode, onModeChange, isMobileOpen, onMobileToggle, hackerModeEnabled = false }: SidebarProps) {
  const { user, logout, isLoggingOut } = useAuth();
  
  // Include hacker mode only if enabled by admin
  const availableModes = hackerModeEnabled ? [...conversationModes, hackerMode] : conversationModes;
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onMobileToggle(false)}
        />
      )}
      
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-80 bg-dark-secondary border-r border-gray-700 transform transition-transform duration-200 ease-in-out relative",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <SidebarScrollIndicator containerSelector=".sidebar-area .smooth-scroll" />
        <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-primary to-purple-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white">Shivaay AI</h1>
              <p className="text-xs lg:text-sm text-muted">Local Assistant</p>
            </div>
          </div>
          <div className="mt-3 lg:mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm text-muted">Real-time Web Search</span>
            <span className="text-xs lg:text-sm text-muted">•</span>
            <span className="text-xs lg:text-sm text-muted">AI Auto-Select</span>
          </div>
        </div>

        {/* Conversation Modes */}
        <div className="flex-1 overflow-y-auto smooth-scroll p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-semibold text-muted uppercase tracking-wider mb-3 lg:mb-4">
            Conversation Modes
          </h3>
          <div className="space-y-2">
            {availableModes.map((mode) => {
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
                    "w-full p-3 lg:p-4 rounded-xl text-left transition-all duration-200",
                    isActive
                      ? "bg-purple-primary bg-opacity-20 border border-purple-primary"
                      : "bg-dark-tertiary hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className={cn("w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center", mode.color)}>
                      <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm lg:text-base font-semibold text-white">{mode.name}</h4>
                      <p className="text-xs lg:text-sm text-muted">{mode.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-3 lg:p-4 border-t border-gray-700">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
              </div>
              
              <Button
                onClick={logout}
                disabled={isLoggingOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  );
}
