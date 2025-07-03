import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ChatArea from "@/components/chat-area";
import { ConversationMode, AIModel } from "@shared/schema";

export default function ChatPage() {
  const [currentMode, setCurrentMode] = useState<ConversationMode>("general");
  const [selectedModel, setSelectedModel] = useState<AIModel | "auto">("auto");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hackerModeEnabled, setHackerModeEnabled] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-dark-primary text-white flex">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={setIsMobileMenuOpen}
        hackerModeEnabled={hackerModeEnabled}
      />
      
      <ChatArea
        currentMode={currentMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        hackerModeEnabled={hackerModeEnabled}
        onToggleHackerMode={setHackerModeEnabled}
      />
    </div>
  );
}
