
import { 
  Search, Plus, Scan, Clock, Package, TrendingUp, IndianRupee, AlertCircle, ArrowRight, Eye, Check, Award, Smile, 
  Apple, Utensils, Box, Milk, Ghost, Sparkles, User, ShieldAlert, Bell, Settings, Heart, ChevronRight, LogOut, 
  HelpCircle, FileText, Smartphone, Globe, Moon, Users, Image as ImageIcon, Loader2, MessageCircle,
  Filter, ChevronLeft, ChevronRight as ChevronRightIcon, Volume2, Timer, Award as Medal, MapPin, BarChart3, Calendar, ChevronDown, X, QrCode, FileText as ReceiptIcon,
  Refrigerator, Snowflake, Mic, PlusCircle, Headset, Camera, Loader, Bot
} from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import { FoodItem, StorageLocation } from './types';
import { MOCK_ITEMS } from './constants';
import ChatBot from './components/ChatBot';
import Analytics from './components/Analytics';
import ShoppingList from './components/ShoppingList';
import FamilyManagement from './components/FamilyManagement';
import RecipeGenerator from './components/RecipeGenerator';
import GeminiSettings from './components/GeminiSettings';
import { VoiceChat } from './components/VoiceChat';
import { getAiInstance } from './services/geminiService';
import { Type } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<FoodItem[]>(MOCK_ITEMS);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isCapturingProfile, setIsCapturingProfile] = useState(false);
  const [scannerMode, setScannerMode] = useState<'barcode' | 'qrcode' | 'receipt'>('barcode');
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [scannedReceiptItems, setScannedReceiptItems] = useState<Partial<FoodItem>[]>([]);
  const [showReceiptConfirm, setShowReceiptConfirm] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const profileVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (activeTab === 'scanner') {
      startCamera(videoRef);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const startCamera = async (ref: React.RefObject<HTMLVideoElement | null>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: ref === videoRef ? 'environment' : 'user' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCaptureReceipt = async () => {
    if (!videoRef.current || isProcessingReceipt) return;

    setIsProcessingReceipt(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Extract all food items from this receipt. For each item, guess a reasonable expiry date based on the current date (Jan 15, 2026). Format as JSON array of objects with 'name', 'quantity', and 'expiryDate' (ISO string)." }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                expiryDate: { type: Type.STRING }
              },
              required: ['name', 'quantity', 'expiryDate']
            }
          }
        }
      });

      const extracted = JSON.parse(response.text || '[]');
      setScannedReceiptItems(extracted);
      setShowReceiptConfirm(true);
    } catch (error) {
      console.error("Receipt processing failed:", error);
      alert("Failed to read receipt. Please try again.");
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const confirmReceiptItems = () => {
    const newItems: FoodItem[] = scannedReceiptItems.map((item, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name || 'Unknown Item',
      category: 'Pantry Essentials',
      expiryDate: item.expiryDate || new Date().toISOString(),
      storage: StorageLocation.PANTRY,
      quantity: item.quantity || 1,
      unit: 'pcs',
      addedAt: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200&h=200'
    }));

    setItems(prev => [...prev, ...newItems]);
    setShowReceiptConfirm(false);
    setScannedReceiptItems([]);
    setActiveTab('inventory');
  };

  const handleCaptureProfileImage = () => {
    if (profileVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = profileVideoRef.current.videoWidth;
      canvas.height = profileVideoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(profileVideoRef.current, 0, 0);
        setProfileImage(canvas.toDataURL('image/jpeg'));
        setIsCapturingProfile(false);
        stopCamera();
      }
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesLocation = selectedLocation === 'All Items' || item.storage === selectedLocation;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLocation && matchesSearch;
    });
  }, [items, selectedLocation, searchQuery]);

  const urgentItems = useMemo(() => {
    const now = new Date();
    return items.filter(item => {
      const expiry = new Date(item.expiryDate);
      const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7 && diffDays > -1;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [items]);

  const handleMarkAsUsed = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getCount = (loc: string) => {
    if (loc === 'All Items') return items.length;
    return items.filter(i => i.storage === loc).length;
  };

  const getInstructionText = () => {
    switch(scannerMode) {
      case 'barcode': return 'Align barcode within frame';
      case 'qrcode': return 'Align QR code within frame';
      case 'receipt': return 'Align receipt within frame';
      default: return 'Align code within frame';
    }
  };

  const renderDashboard = () => (
    <div className="flex flex-col min-h-full pb-32 animate-in fade-in duration-700 overflow-y-auto no-scrollbar relative">
      <section className="pt-6 mb-8 px-6 relative z-10">
        <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-7 border-2 border-[#F0F0F0] shadow-sm group">
          {/* Animated Mesh/Gradient Background in Box (Matching PRD screenshot) */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F8F9FA] to-white z-0" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CAF50]/5 rounded-full blur-3xl -translate-y-12 translate-x-12 animate-pulse" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="max-w-[70%]">
              <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
                Welcome back! 👋
              </h2>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                Thursday, January 15, 2026
              </p>
              <div className="mt-6 px-4 py-2 bg-[#E8F5E9] rounded-full inline-flex items-center gap-2 border border-[#C8E6C9] group-hover:bg-[#C8E6C9] transition-colors cursor-pointer">
                <p className="text-[10px] font-bold text-[#2E7D32]">
                  You have <span className="font-black underline">3 items</span> expiring soon
                </p>
              </div>
            </div>

            {/* Voice Assistant Button with Glow (Matching PRD screenshot) */}
            <div className="relative p-2">
               <div className="absolute inset-0 bg-[#4CAF50]/20 rounded-3xl blur-md scale-110 animate-pulse" />
               <button 
                 onClick={() => setShowVoiceChat(true)}
                 className="relative w-16 h-16 bg-[#4CAF50] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all border border-white/20"
               >
                 <Mic className="w-7 h-7" />
               </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 px-6 relative z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#E8F5E9] p-5 rounded-[2rem] shadow-sm flex flex-col justify-between h-36 border-2 border-white">
             <div className="flex justify-between items-start">
                <div className="p-2 bg-white rounded-xl text-[#4CAF50] shadow-sm"><IndianRupee className="w-4 h-4" /></div>
                <div className="text-[#4CAF50] font-black text-[10px] uppercase tracking-tighter">+23%</div>
             </div>
             <div>
                <div className="text-2xl font-bold text-gray-800">₹1,240</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Money Saved</div>
             </div>
          </div>
          
          <div className="bg-[#E3F2FD] p-5 rounded-[2rem] shadow-sm flex flex-col justify-between h-36 border-2 border-white">
             <div className="flex justify-between items-start">
                <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm"><BarChart3 className="w-4 h-4" /></div>
                <div className="text-blue-500 font-black text-[10px] uppercase tracking-tighter">+8%</div>
             </div>
             <div>
                <div className="text-2xl font-bold text-gray-800">92%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Waste Reduced</div>
             </div>
          </div>
        </div>
      </section>

      <section className="mb-8 px-6 relative z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Quick Access</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {[
            { name: 'Fridge', icon: Refrigerator, count: getCount(StorageLocation.FRIDGE), color: 'text-blue-500', bg: 'bg-[#F0F7FF]' },
            { name: 'Pantry', icon: Box, count: getCount(StorageLocation.PANTRY), color: 'text-orange-500', bg: 'bg-[#FFF9F0]' },
            { name: 'Freezer', icon: Snowflake, count: getCount(StorageLocation.FREEZER), color: 'text-cyan-500', bg: 'bg-[#F0FFFF]' }
          ].map((loc) => (
            <button 
              key={loc.name}
              onClick={() => { setSelectedLocation(loc.name as any); setActiveTab('inventory'); }}
              className="min-w-[95px] bg-white p-4 rounded-[1.8rem] border-2 border-[#F0F0F0] shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all"
            >
              <div className={`p-2.5 ${loc.bg} rounded-xl`}>
                <loc.icon className={`w-6 h-6 ${loc.color}`} />
              </div>
              <div className="text-center">
                <div className="text-[11px] font-bold text-gray-800">{loc.name}</div>
                <div className="text-[8px] font-black text-gray-400 tracking-tighter uppercase">{loc.count} ITEMS</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8 px-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Urgent Attention</h2>
          <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-[#4CAF50]">View All <ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="space-y-4">
          {urgentItems.slice(0, 3).map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] border-2 border-[#F0F0F0] p-4 flex gap-4 shadow-sm group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{item.storage} • {item.quantity}{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF9800] bg-orange-50 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Urgent</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-white border-2 border-[#F0F0F0] rounded-xl py-2 text-[10px] font-bold text-gray-500">Details</button>
                  <button onClick={() => handleMarkAsUsed(item.id)} className="flex-1 bg-[#4CAF50] text-white rounded-xl py-2 text-[10px] font-bold shadow-lg shadow-green-100/20">Used</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#FDFCF0]">
      <Layout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} onAddClick={() => setActiveTab('scanner')} unreadCount={urgentItems.length}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'inventory' && (
           <div className="h-full overflow-y-auto no-scrollbar relative z-10 pt-4 px-6 pb-40">
             <h1 className="text-2xl font-bold text-gray-800 mb-6">My Inventory</h1>
             <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
               {['All Items', StorageLocation.FRIDGE, StorageLocation.PANTRY, StorageLocation.FREEZER].map((loc) => (
                 <button
                   key={loc}
                   onClick={() => setSelectedLocation(loc)}
                   className={`px-6 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                     selectedLocation === loc ? 'bg-[#4CAF50] border-[#4CAF50] text-white' : 'bg-white border-[#F0F0F0] text-gray-400'
                   }`}
                 >
                   {loc}
                 </button>
               ))}
             </div>
             <div className="grid grid-cols-2 gap-4">
               {filteredItems.map(item => (
                 <div key={item.id} className="bg-white rounded-[2rem] border-2 border-[#F0F0F0] overflow-hidden group">
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4">
                       <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                       <p className="text-[10px] font-bold text-gray-400 mt-1">{item.quantity} {item.unit}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}
        {activeTab === 'scanner' && (
          <div className="fixed inset-0 bg-[#000000] z-[200] flex flex-col items-center justify-between animate-in fade-in">
             {/* Header */}
             <div className="w-full flex justify-between items-center p-6">
               <button onClick={() => setActiveTab('dashboard')} className="text-white p-2">
                 <X className="w-8 h-8" />
               </button>
             </div>

             {/* Main Scan View */}
             <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
               <h3 className="text-white font-medium text-lg mb-10 transition-all duration-300">
                 {getInstructionText()}
               </h3>
               
               <div className="w-full max-w-sm aspect-square relative px-4">
                  {/* The Green Corners (Prominent & Thicker) */}
                  <div className="absolute -top-1 -left-1 w-16 h-16 border-t-[6px] border-l-[6px] border-[#4CAF50] rounded-tl-[3rem] z-30" />
                  <div className="absolute -top-1 -right-1 w-16 h-16 border-t-[6px] border-r-[6px] border-[#4CAF50] rounded-tr-[3rem] z-30" />
                  <div className="absolute -bottom-1 -left-1 w-16 h-16 border-b-[6px] border-l-[6px] border-[#4CAF50] rounded-bl-[3rem] z-30" />
                  <div className="absolute -bottom-1 -right-1 w-16 h-16 border-b-[6px] border-r-[6px] border-[#4CAF50] rounded-br-[3rem] z-30" />
                  
                  {/* Frame Container */}
                  <div className="w-full h-full bg-[#121212] rounded-3xl overflow-hidden relative border-2 border-white/5 flex flex-col items-center justify-center shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
                    
                    {/* The Smooth Scanning Line Animation */}
                    <div className="absolute inset-x-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#4CAF50] to-transparent shadow-[0_0_25px_#4CAF50] z-20 animate-[scanLineSmooth_2.5s_linear_infinite]" />

                    {/* Error Center (Conditional visibility if needed) */}
                    <div className="relative z-10 flex flex-col items-center gap-4 text-white/40 text-center px-10 select-none">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <AlertCircle className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-semibold tracking-wide">Ready to scan...</p>
                    </div>
                  </div>

                  {/* Floating Action Button for Gallery (matching screenshot) */}
                  <button className="absolute -bottom-10 right-4 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center text-white border-2 border-white/10 active:scale-90 transition-all shadow-2xl hover:bg-white/20">
                    <ImageIcon className="w-7 h-7" />
                  </button>
               </div>
             </div>

             {/* Bottom Navigation (matching screenshot) */}
             <div className="w-full px-6 pb-12 pt-6 flex justify-center gap-4 bg-gradient-to-t from-black via-black/80 to-transparent">
               <button 
                 onClick={() => setScannerMode('barcode')}
                 className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-[2rem] transition-all duration-300 ${scannerMode === 'barcode' ? 'bg-[#4CAF50] text-white shadow-lg shadow-green-900/40 translate-y-[-4px]' : 'bg-[#121212] text-white/40 border border-white/5'}`}
               >
                 <Scan className="w-6 h-6" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Barcode</span>
               </button>
               <button 
                 onClick={() => setScannerMode('qrcode')}
                 className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-[2rem] transition-all duration-300 ${scannerMode === 'qrcode' ? 'bg-[#4CAF50] text-white shadow-lg shadow-green-900/40 translate-y-[-4px]' : 'bg-[#121212] text-white/40 border border-white/5'}`}
               >
                 <QrCode className="w-6 h-6" />
                 <span className="text-[10px] font-black uppercase tracking-widest">QR Code</span>
               </button>
               <button 
                 onClick={() => setScannerMode('receipt')}
                 className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-[2rem] transition-all duration-300 ${scannerMode === 'receipt' ? 'bg-[#4CAF50] text-white shadow-lg shadow-green-900/40 translate-y-[-4px]' : 'bg-[#121212] text-white/40 border border-white/5'}`}
               >
                 <ReceiptIcon className="w-6 h-6" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Receipt</span>
               </button>
             </div>

             {isProcessingReceipt && (
                <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 text-white animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-[#4CAF50]/20 border-t-[#4CAF50] animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#4CAF50] animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-black tracking-[0.2em] uppercase text-[#4CAF50]">Reading Receipt</p>
                    <p className="text-xs font-bold text-white/50">Gemini AI is analyzing items...</p>
                  </div>
                </div>
             )}

             {showReceiptConfirm && (
               <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[210] flex items-end animate-in slide-in-from-bottom duration-500">
                 <div className="w-full bg-[#FDFCF0] rounded-t-[4rem] p-10 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-2xl font-black text-[#1A1A1A]">Confirm Items</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#4CAF50] mt-1">Extracted from receipt</p>
                     </div>
                     <button onClick={() => setShowReceiptConfirm(false)} className="p-4 bg-gray-100 rounded-3xl active:scale-90 transition-all"><X className="w-6 h-6" /></button>
                   </div>
                   <div className="space-y-4">
                     {scannedReceiptItems.map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 bg-white border-2 border-[#F0F0F0] rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                         <div>
                           <p className="font-black text-gray-800 text-lg leading-tight">{item.name}</p>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Exp: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'Auto-Calculated'}</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="bg-[#E8F5E9] text-[#4CAF50] px-4 py-2 rounded-2xl text-xs font-black border border-[#C8E6C9]">x{item.quantity}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                   <button onClick={confirmReceiptItems} className="w-full bg-[#4CAF50] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(76,175,80,0.3)] hover:translate-y-[-2px] active:scale-95 transition-all text-sm">Add to Inventory</button>
                 </div>
               </div>
             )}
          </div>
        )}
        {activeTab === 'recipes' && <RecipeGenerator inventory={items} />}
        {activeTab === 'more' && (
          <div className="h-full overflow-y-auto no-scrollbar pt-6 pb-40 relative px-6 animate-in slide-in-from-bottom duration-500">
             <header className="flex flex-col items-center text-center mb-8 relative">
                <div className="relative group mb-4">
                  <div className="w-24 h-24 bg-white rounded-full border-4 border-[#F0F0F0] p-1 flex items-center justify-center shadow-lg overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-[#E8F5E9] rounded-full flex items-center justify-center text-[#4CAF50]">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setIsCapturingProfile(true);
                      startCamera(profileVideoRef);
                    }}
                    className="absolute bottom-0 right-0 bg-[#4CAF50] text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-white"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* ChatBot Quick Launch Button next to profile picture */}
                  <button 
                    onClick={() => setShowChatBot(true)}
                    className="absolute -top-2 -right-2 bg-white text-[#4CAF50] p-2.5 rounded-full shadow-lg border-2 border-[#F0F0F0] active:scale-90 transition-all z-20 hover:bg-[#E8F5E9]"
                  >
                    <Bot className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-[#1A2E35]">Pantry Master</h2>
                <div className="mt-2">
                  <span className="text-[10px] font-black text-[#4CAF50] bg-[#E8F5E9] px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#C8E6C9]">
                    Pro Member
                  </span>
                </div>
             </header>

             {isCapturingProfile && (
               <div className="fixed inset-0 bg-black z-[250] flex flex-col items-center justify-center p-6">
                 <div className="w-full max-sm aspect-square border-4 border-[#4CAF50] rounded-[3rem] relative overflow-hidden bg-zinc-900">
                    <video ref={profileVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                 </div>
                 <div className="flex gap-4 mt-12">
                   <button 
                    onClick={() => {
                      setIsCapturingProfile(false);
                      stopCamera();
                    }}
                    className="px-6 py-3 bg-white/10 text-white rounded-2xl font-bold"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleCaptureProfileImage}
                    className="px-8 py-3 bg-[#4CAF50] text-white rounded-2xl font-bold shadow-lg"
                   >
                     Capture Photo
                   </button>
                 </div>
               </div>
             )}

             <div className="space-y-6">
                <div className="bg-white rounded-[2.5rem] border-2 border-[#F0F0F0] p-1 shadow-sm overflow-hidden">
                   <GeminiSettings />
                </div>
                
                <button onClick={() => setShowAnalytics(true)} className="w-full bg-white border-2 border-[#F0F0F0] p-6 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all group shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#E8F5E9] text-[#4CAF50] rounded-2xl shadow-inner"><BarChart3 className="w-6 h-6" /></div>
                      <div className="text-left">
                         <h4 className="font-bold text-gray-800 text-sm">Waste Insights</h4>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">View your patterns</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-4 flex flex-col items-center">
                  <button className="flex items-center justify-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] py-4 px-8 border-2 border-red-50 rounded-full hover:bg-red-50 transition-colors">
                     <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
             </div>
          </div>
        )}
      </Layout>

      {showVoiceChat && <VoiceChat onClose={() => setShowVoiceChat(false)} inventoryContext={items.map(i => i.name).join(', ')} />}
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} inventoryContext={items.map(i => i.name).join(', ')} />}
      {showAnalytics && <Analytics onBack={() => setShowAnalytics(false)} />}
    </div>
  );
};

export default App;
