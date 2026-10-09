import { useState } from 'react';

export function useVoiceAgent(isOpen: boolean) {
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<string>('أهلاً فيكِ! أنا نادين، مستشارتك العقارية. اضغطِ على زر (تحدث) لنبدأ المحادثة.');
  const [userText, setUserText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    setError(null);
    setUserText('أريد شقة فخمة في بيروت');
    setCallState('listening');
    setTranscript('عم بسمع طلبك العقاري...');

    setTimeout(() => {
      setCallState('thinking');
      setTranscript('جاري البحث في قاعدة البيانات...');
    }, 900);

    setTimeout(() => {
      setCallState('speaking');
      setTranscript('أهلاً فيكِ! عنا أحلى الشقق والفلل ببيروت وكسروان، تبدأ الأسعار من 150 ألف دولار. تحبِ نفلتر لك النتائج حسب المنطقة؟');
      setCallState('idle');
    }, 2000);
  };

  const stopAll = () => {
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