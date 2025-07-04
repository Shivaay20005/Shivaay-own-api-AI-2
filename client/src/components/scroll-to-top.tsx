import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    const chatContainer = document.querySelector('.smooth-scroll');
    if (chatContainer && chatContainer.scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    const chatContainer = document.querySelector('.smooth-scroll');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', toggleVisibility);
      return () => chatContainer.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    const chatContainer = document.querySelector('.smooth-scroll');
    if (chatContainer) {
      chatContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={scrollToTop}
        className="bg-purple-primary hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        size="sm"
      >
        <ChevronUp className="w-5 h-5" />
      </Button>
    </div>
  );
}