import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onSpeakResponse?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function VoiceButton({ 
  onTranscript, 
  onSpeakResponse,
  disabled = false,
  className 
}: VoiceButtonProps) {
  const { toast } = useToast();
  
  const {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported
  } = useVoiceAssistant({
    onTranscript: (text) => {
      onTranscript(text);
      toast({
        title: "Voice Input Received",
        description: `"${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error,
        variant: "destructive",
      });
    },
    language: "hi-IN" // Hindi language support
  });

  // Expose speak function to parent component
  if (onSpeakResponse && !window.shivaaySpeak) {
    window.shivaaySpeak = speak;
  }

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      // Check if we're on a secure context (HTTPS or localhost)
      if (!window.isSecureContext && location.hostname !== "localhost") {
        toast({
          title: "Secure Connection Required",
          description: "Voice recognition requires HTTPS. Please use a secure connection.",
          variant: "destructive",
        });
        return;
      }
      
      await startListening();
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {/* Voice Input Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleVoiceToggle}
        disabled={disabled}
        className={cn(
          "h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800",
          isListening && "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
          className
        )}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 animate-pulse" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Speaking Indicator/Control */}
      {isSpeaking && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSpeakToggle}
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
          title="Stop speaking"
        >
          <Volume2 className="h-4 w-4 animate-pulse" />
        </Button>
      )}
    </div>
  );
}

// Extend window to include our speak function
declare global {
  interface Window {
    shivaaySpeak?: (text: string) => void;
  }
}