import { useState, useEffect } from "react";

interface SidebarScrollIndicatorProps {
  containerSelector: string;
}

export default function SidebarScrollIndicator({ containerSelector }: SidebarScrollIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const sidebar = document.querySelector(containerSelector);
      if (sidebar) {
        const scrollTop = sidebar.scrollTop;
        const scrollHeight = sidebar.scrollHeight - sidebar.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);
      }
    };

    const sidebar = document.querySelector(containerSelector);
    if (sidebar) {
      sidebar.addEventListener('scroll', updateScrollProgress);
      updateScrollProgress(); // Initial calculation
      
      return () => sidebar.removeEventListener('scroll', updateScrollProgress);
    }
  }, [containerSelector]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-700/30">
      <div 
        className="bg-purple-primary/60 w-full transition-all duration-300 ease-out"
        style={{ height: `${scrollProgress}%` }}
      />
    </div>
  );
}