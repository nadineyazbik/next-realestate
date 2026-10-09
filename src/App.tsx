import { useState, useEffect, useRef } from 'react';

export function useVoiceAgent(isOpen: boolean) {
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<string>('أهلاً فيكِ! أنا نادين، مستشارتك العقارية. اضغطِ على زر (تحدث) لنبدأ المحادثة.');
  const [userText, setUserText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-LB';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setCallState('listening');
        setTranscript('عم بسمع طلبك العقاري...');
      };

      recognition.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        setUserText(speechText);
        setCallState('thinking');
        setTranscript('جارٍ معالجة طلبك...');

        // Simulate smart Lebanese AI response
        setTimeout(() => {
          setCallState('speaking');
          let reply = 'أهلاً فيكِ! عنا أحلى الشقق والفلل ببيروت وكسروان، تبدأ الأسعار من 150 ألف دولار.';
          const lower = speechText.toLowerCase();
          if (lower.includes('إيجار') || lower.includes('rent')) {
            reply = 'متوفر عنا شقق للإيجار الشهري والسنوي بمناطق راقية جداً.';
          }
          setTranscript(reply);
          setCallState('idle');
        }, 1200);
      };

      recognition.onerror = () => {
        setError('تعذر سماع الصوت، حاول مرة أخرى.');
        setCallState('idle');
      };

      recognition.onend = () => {
        if (callState === 'listening') {
          setCallState('idle');
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    setError(null);
    setUserText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started or busy
      }
    } else {
      // Fallback if browser doesn't support speech recognition
      setCallState('listening');
      setTimeout(() => {
        setCallState('speaking');
        setTranscript('أهلاً فيكِ! عنا أحلى الشقق ببيروت وكسروان تبدأ من 150 ألف دولار.');
        setCallState('idle');
      }, 1500);
    }
  };

  const stopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setCallState('idle');
  };

  return {
    callState,
    transcript,
    userText,
    error,
    startListening,
    stopAll,
  };
}