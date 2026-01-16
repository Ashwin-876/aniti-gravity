
import React, { useState, useEffect } from 'react';
import { Settings2, Eye, EyeOff, Check, CheckCircle2, Zap, Loader2, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const GeminiSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [usePersonalKey, setUsePersonalKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('user_gemini_api_key');
    const toggle = localStorage.getItem('use_personal_key') === 'true';
    if (savedKey) setApiKey(savedKey);
    setUsePersonalKey(toggle);
  }, []);

  const handleSave = () => {
    localStorage.setItem('user_gemini_api_key', apiKey);
    localStorage.setItem('use_personal_key', String(usePersonalKey));
    window.dispatchEvent(new Event('storage'));
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const testConnection = async () => {
    if (!apiKey) {
      setStatus('error');
      setErrorMessage('Please enter a key first.');
      return;
    }

    setStatus('testing');
    try {
      const testAi = new GoogleGenAI({ apiKey });
      const response = await testAi.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Reply with the word "VERIFIED" if this key is valid.',
      });
      
      if (response.text?.toUpperCase().includes('VERIFIED')) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Key accepted but returned an unexpected response.');
      }
    } catch (e: any) {
      console.error("Test API error", e);
      setStatus('error');
      setErrorMessage(e.message || 'Key accepted but returned an unexpected response.');
    }
  };

  const removeKey = () => {
    localStorage.removeItem('user_gemini_api_key');
    localStorage.setItem('use_personal_key', 'false');
    setApiKey('');
    setUsePersonalKey(false);
    setStatus('idle');
  };

  return (
    <div className="bg-white p-6 space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-800" strokeWidth={3} />
          <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">AI Configuration</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Personal Key</span>
          <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-white shadow-inner" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block px-1 tracking-widest">Gemini API Key</label>
          <div className="relative group">
            <input 
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your key here..."
              className="w-full bg-[#FDFCF0] border-2 border-[#F0F0F0] rounded-2xl py-4 px-5 text-sm font-bold text-gray-700 outline-none focus:border-[#4CAF50] transition-all placeholder:text-gray-200 tracking-[0.2em]"
            />
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={testConnection}
            disabled={status === 'testing'}
            className="flex items-center justify-center gap-2 bg-[#E3F2FD] text-[#2196F3] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
          >
            {status === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
            Test
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-[#E8F5E9] text-[#4CAF50] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            {status === 'success' ? (
              <Check className="w-4 h-4 stroke-[3px]" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Save
          </button>
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl text-[10px] font-bold border border-red-100 animate-in zoom-in duration-200">
            <div className="w-4 h-4 rounded-full border border-red-500 flex items-center justify-center shrink-0">
               <AlertCircle className="w-2.5 h-2.5" />
            </div>
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 pt-2">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-black text-[#4CAF50] uppercase tracking-widest group border-b-2 border-[#E8F5E9] pb-1 hover:border-[#4CAF50] transition-all"
          >
            Get a free API Key <ExternalLink className="w-3 h-3" />
          </a>
          
          {apiKey && (
            <button 
              onClick={removeKey}
              className="flex items-center gap-1.5 text-gray-300 hover:text-red-400 text-[8px] font-black uppercase tracking-widest transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Remove Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiSettings;
