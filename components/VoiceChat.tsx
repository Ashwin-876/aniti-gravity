
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { getAiInstance } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';

interface VoiceChatProps {
  onClose: () => void;
  inventoryContext: string;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ onClose, inventoryContext }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Connecting...');
  const [transcription, setTranscription] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionActiveRef = useRef(false);

  // Manual base64 decoding helper
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Manual base64 encoding helper
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Raw PCM decoding helper
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    setError(null);
    setStatus('Connecting...');
    try {
      // Re-fetch AI instance right before connection
      const ai = getAiInstance();
      
      // Initialize audio contexts if not present
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live session established");
            setStatus('Listening...');
            setIsActive(true);
            sessionActiveRef.current = true;
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (!sessionActiveRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const pcmBase64 = encode(new Uint8Array(int16.buffer));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { 
                    data: pcmBase64, 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                });
              }).catch(err => {
                console.error("Session send failed", err);
              });
            };
            
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              if (ctx.state === 'suspended') await ctx.resume();

              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioData = decode(base64Audio);
              const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }

            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).trim());
            }
          },
          onclose: () => {
            console.log("Gemini Live session closed");
            setStatus('Disconnected');
            setIsActive(false);
            sessionActiveRef.current = false;
          },
          onerror: (e) => {
            console.error("Gemini Live error:", e);
            setStatus('Error');
            setError('Connection failed. Please ensure your API key is correct and valid.');
            setIsActive(false);
            sessionActiveRef.current = false;
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are the Expronix AI Voice Assistant.
          Inventory context: ${inventoryContext}.
          Always respond via audio. Be brief, helpful, and friendly.
          Provide tips on food storage, quick meal ideas, or ways to reduce waste based on the inventory.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      
    } catch (e) {
      console.error("Init Error:", e);
      setStatus('Connection Issue');
      setError('Unable to reach the Gemini Voice server. Check your network or API settings.');
    }
  };

  useEffect(() => {
    startSession();
    return () => {
      sessionActiveRef.current = false;
      for (const source of sourcesRef.current.values()) {
        try { source.stop(); } catch(e) {}
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
      <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white active:scale-90 transition-all hover:bg-white/20">
        <X className="w-8 h-8" />
      </button>

      <div className="flex flex-col items-center space-y-12 w-full max-w-sm text-center">
        <div className="relative">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
            error ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 
            isSpeaking ? 'bg-[#4CAF50] scale-110 shadow-[0_0_80px_rgba(76,175,80,0.8)]' : 
            'bg-[#4CAF50] scale-100 shadow-[0_0_50px_rgba(76,175,80,0.5)]'
          }`}>
            {error ? <AlertCircle className="w-12 h-12 text-white" /> : 
             isSpeaking ? <Volume2 className="w-12 h-12 text-white animate-pulse" /> : 
             <Mic className="w-12 h-12 text-white" />}
          </div>
          
          {isActive && !error && (
            <div className="absolute -inset-4 border-2 border-[#4CAF50]/30 rounded-full animate-ping pointer-events-none" />
          )}
          
          {isSpeaking && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1 h-4 items-end">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-1.5 bg-[#4CAF50] rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms`, height: `${30 + Math.random() * 70}%` }} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {!error && <Sparkles className="w-5 h-5 text-[#4CAF50]" />}
            <h2 className="text-2xl font-bold text-white tracking-tight">{error ? "Connection Issue" : status}</h2>
          </div>
          <div className="min-h-[60px] flex items-center justify-center">
            <p className="text-white/80 text-sm font-medium px-4 leading-relaxed">
              {error ? error : transcription || "Ask me about your kitchen inventory..."}
            </p>
          </div>
        </div>

        {!error && (
          <div className="pt-8 w-full">
             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
               <div 
                 className={`h-full bg-[#4CAF50] transition-all duration-300 ${isSpeaking ? 'w-full' : 'w-0'}`} 
                 style={{ transitionTimingFunction: 'linear' }}
               />
             </div>
          </div>
        )}
        
        {error && (
          <button 
            onClick={startSession}
            className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
          >
            <Loader2 className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
};
