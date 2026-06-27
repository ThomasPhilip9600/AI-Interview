import { useState, useEffect, useRef } from 'react';

export default function useSpeechRecognition(isRecording) {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const fullTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentInterim = '';
      let newFinal = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      
      if (newFinal) {
        fullTranscriptRef.current += newFinal + ' ';
      }
      
      setTranscript(fullTranscriptRef.current + currentInterim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // If we are still supposed to be recording, restart it
      if (isRecordingRef.current) {
        try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    isRecordingRef.current = isRecording;
    if (isRecording && recognitionRef.current) {
      setTranscript('');
      fullTranscriptRef.current = '';
      try {
        recognitionRef.current.start();
      } catch (e) {}
    } else if (!isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isRecording]);

  return { transcript };
}
