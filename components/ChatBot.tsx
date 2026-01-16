
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles, Mic, Volume2 } from 'lucide-react';
import { getAiInstance, transcribeAudio } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  onClose: () => void;
  inventoryContext: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose, inventoryContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your Expronix Assistant. How can I help you manage your pantry today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // Fixed missing setStatus by adding a local status state for UI feedback
  const [status, setStatus] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          // Fixed setStatus usage by defining it in useState
          setStatus('Transcribing...');
          const text = await transcribeAudio(base64);
          if (text) setInput(text);
          setStatus('');
          setIsRecording(false);
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: textToSend,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          systemInstruction: `You are a high-intelligence kitchen assistant. Use complex reasoning to help. Context: ${inventoryContext}.`,
        },
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I encountered an issue.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Connection issue. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#4CAF50]"><Bot className="w-6 h-6" /></div>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-bold text-gray-800">AI Expert</h2>
              <Sparkles className="w-3 h-3 text-[#4CAF50]" />
            </div>
            <p className="text-[10px] text-[#4CAF50] font-bold uppercase tracking-wider">Advanced Reasoning</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#FDFCF0]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-[#4CAF50] text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border-2 border-[#F0F0F0]'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white p-4 rounded-3xl border-2 border-[#F0F0F0]"><Loader2 className="w-5 h-5 text-[#4CAF50] animate-spin" /></div></div>}
      </div>

      <div className="p-4 bg-white border-t-2 border-[#FDFCF0]">
        {status && <p className="text-[10px] text-center mb-2 font-bold text-[#4CAF50] animate-pulse">{status}</p>}
        <div className="flex gap-2 items-center bg-[#FDFCF0] rounded-3xl p-2 border-2 border-[#F0F0F0]">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-2xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 border border-gray-100'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Type or record a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-1 font-bold text-gray-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={() => handleSend()} className="p-3 bg-[#4CAF50] text-white rounded-2xl shadow-lg shadow-green-100"><Send className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
