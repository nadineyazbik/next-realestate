import { useCallback, useEffect, useRef, useState } from 'react';

export type CallState = 'idle' | 'listening' | 'thinking' | 'speaking';
type Msg = { role: 'user' | 'assistant'; text: string };

const GREETING = 'أهلاً فيك! أنا نادين، مستشارتك العقارية. اضغطي على زر (تحدث) لنبدأ المحادثة.';

function localReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('بيروت')) return 'عنا شقق وفلل حلوين ببيروت. بتحبي للبيع ولا للإيجار؟';
  if (t.includes('كسروان') || t.includes('جونية')) return 'كسروان عنا فيها خيارات كتير حلوة، شقق وفلل بإطلالات. شو ميزانيتك؟';
  if (t.includes('جبل')) return 'بجبل لبنان عنا فلل وشاليهات. كم غرفة نوم بدك؟';
  if (t.includes('إيجار') || t.includes('ايجار')) return 'عنا عقارات للإيجار. بأي منطقة بدك؟';
  if (t.includes('بيع') || t.includes('شراء') || t.includes('اشتري')) return 'تمام، عنا عقارات للبيع. شو نوع العقار اللي بدك ياه؟ شقة، فيلا، ولا أرض؟';
  if (t.includes('سعر') || t.includes('كم') || t.includes('ميزانية')) return 'الأسعار بتبدأ من حوالي 150 ألف دولار، وبتختلف حسب المنطقة. أي منطقة بتحبي؟';
  if (t.includes('شقة') || t.includes('شقه')) return 'عنا شقق كتير حلوة. بأي منطقة وكم غرفة نوم بدك؟';
  if (t.includes('فيلا') || t.includes('فلة')) return 'عنا فلل فخمة. بأي منطقة بتفضلي؟';
  if (t.includes('مرحبا') || t.includes('هاي') || t.includes('أهلا') || t.includes('اهلا'))
    return 'أهلين فيكي! كيف فيني ساعدك بالعقارات اليوم؟';
  return 'سمعتك. فيكي تقليلي شو نوع العقار والمنطقة اللي بتفضليها؟';
}

async function getAIReply(message: string, history: Msg[]): Promise<string> {
  try {
    const res = await fetch('/api/voice-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('backend ' + res.status);
    const data = await res.json();
    if (data && typeof data.reply === 'string' && data.reply) return data.reply;
    throw new Error('empty reply');
  } catch {
    return localReply(message);
  }
}

export function useVoiceAgent() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [transcript, setTranscript] = useState<string>(GREETING);
  const [userText, setUserText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const historyRef = useRef<Msg[]>([]);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setCallState('idle');
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();

    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
    const voice =
      voices.find((v) => v.lang === 'ar-LB') ||
      voices.find((v) => v.lang.startsWith('ar'));

    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || 'ar-SA';
    if (voice) u.voice = voice;
    u.rate = 1;
    u.onstart = () => setCallState('speaking');
    u.onend = () => setCallState('idle');
    u.onerror = () => setCallState('idle');

    setCallState('speaking');
    synth.speak(u);
  }, []);

  const handleUserSpeech = useCallback(
    async (text: string) => {
      setUserText(text);
      setCallState('thinking');
      setTranscript('عم فكّر...');
      historyRef.current.push({ role: 'user', text });
      const reply = await getAIReply(text, historyRef.current);
      historyRef.current.push({ role: 'assistant', text: reply });
      setTranscript(reply);
      speak(reply);
    },
    [speak]
  );

  const startListening = useCallback(() => {
    if (callState !== 'idle') return;
    setError(null);

    try {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      window.speechSynthesis.speak(unlock);
    } catch {}

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('المتصفح ما بيدعم التعرف على الصوت. استعملي Chrome أو Edge.');
      return;
    }

    const rec = new SR();
    rec.lang = 'ar-LB';
    rec.interimResults = true;
    rec.continuous = false;
    recRef.current = rec;

    let finalText = '';

    rec.onstart = () => {
      setCallState('listening');
      setTranscript('عم بسمعك...');
      setUserText('');
    };
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setUserText(finalText || interim);
    };
    rec.onerror = (e: any) => {
      console.error('SpeechRecognition error:', e.error);
      const msgs: Record<string, string> = {
        'not-allowed': 'الميكروفون محظور. اسمحي بالميكروفون.',
        'service-not-allowed': 'الميكروفون محظور من إعدادات المتصفح.',
        'no-speech': 'ما سمعت شي. جرّبي تحكي أقرب للميكروفون.',
        'audio-capture': 'ما لقيت ميكروفون موصول.',
        network: 'مشكلة بالإنترنت بخدمة التعرف على الصوت.',
      };
      setError(msgs[e.error] || 'خطأ بالصوت: ' + e.error);
      setCallState('idle');
    };
    rec.onend = () => {
      if (finalText.trim()) handleUserSpeech(finalText.trim());
      else setCallState((s) => (s === 'listening' ? 'idle' : s));
    };

    try {
      rec.start();
    } catch (err) {
      console.error(err);
      setCallState('idle');
    }
  }, [callState, handleUserSpeech]);

  const stopAll = useCallback(() => {
    try { recRef.current?.abort(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    setCallState('idle');
  }, []);

  return { callState, transcript, userText, error, startListening, stopAll };
}