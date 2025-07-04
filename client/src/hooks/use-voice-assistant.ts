import { useState, useRef, useCallback } from "react";

interface VoiceAssistantConfig {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

export function useVoiceAssistant({
  onTranscript,
  onError,
  language = "hi-IN" // Hindi by default, can be changed to "en-US" for English
}: VoiceAssistantConfig) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      onError?.("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      
      let errorMessage = "Speech recognition error occurred";
      switch (event.error) {
        case "not-allowed":
          errorMessage = "Microphone access denied. Please allow microphone permission in your browser settings.";
          break;
        case "no-speech":
          errorMessage = "No speech detected. Please try speaking closer to your microphone.";
          break;
        case "audio-capture":
          errorMessage = "Microphone not found or not working. Please check your microphone.";
          break;
        case "network":
          errorMessage = "Network error occurred. Please check your internet connection.";
          break;
        case "service-not-allowed":
          errorMessage = "Speech recognition service not allowed. Please use HTTPS or localhost.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [language, onTranscript, onError]);

  // Start listening
  const startListening = useCallback(async () => {
    // First check if we have microphone permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permissionError) {
      onError?.("Microphone permission denied. Please allow microphone access and try again.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        onError?.("Failed to start voice recognition. Make sure you're using HTTPS or localhost.");
      }
    }
  }, [initializeRecognition, isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Speak text
  const speak = useCallback((text: string, voiceIndex = 0) => {
    if (!("speechSynthesis" in window)) {
      onError?.("Text-to-speech is not supported in this browser");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice (try to get Hindi voice or fallback to default)
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => 
      voice.lang.includes('hi') || voice.name.includes('Hindi')
    );
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    } else if (voices[voiceIndex]) {
      utterance.voice = voices[voiceIndex];
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onError?.("Text-to-speech error occurred");
    };

    window.speechSynthesis.speak(utterance);
  }, [onError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: "webkitSpeechRecognition" in window || "SpeechRecognition" in window
  };
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}