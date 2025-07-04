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
    <div className="responsive-container layout-container bg-dark-primary text-white">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className="sidebar-area smooth-scroll">
        <Sidebar
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={setIsMobileMenuOpen}
          hackerModeEnabled={hackerModeEnabled}
        />
      </div>
      
      <div className="main-content-area">
        <ChatArea
          currentMode={currentMode}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          hackerModeEnabled={hackerModeEnabled}
          onToggleHackerMode={setHackerModeEnabled}
        />
      </div>
    </div>
  );
}
