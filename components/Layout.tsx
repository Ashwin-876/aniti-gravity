
import { Home, Search, Heart, Settings, Smile } from 'lucide-react';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  unreadCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick, unreadCount }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FDFCF0] overflow-hidden shadow-2xl relative">
      {/* Header */}
      {activeTab !== 'scanner' && (
        <header className="px-6 pt-6 pb-2 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
               <Smile className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#2E7D32]">Expronix</h1>
          </div>
          <button 
            onClick={() => onTabChange('more')}
            className={`w-10 h-10 bg-white border-2 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${activeTab === 'more' ? 'border-[#4CAF50] text-[#4CAF50] shadow-md shadow-green-100' : 'border-[#F0F0F0] text-gray-400'}`}
          >
            <Smile className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {children}
      </main>

      {/* Black Floating Bottom Nav with Cutout */}
      <div className="absolute bottom-6 left-4 right-4 z-50 pointer-events-none">
        <div className="relative flex justify-center items-end">
          
          {/* Central Action Button (The Burger) */}
          <div className="absolute -top-6 z-10 pointer-events-auto">
            <div className="bg-white p-1 rounded-full shadow-lg">
              <button 
                onClick={() => onTabChange('scanner')}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-inner active:scale-90 transition-transform"
              >
                🍔
              </button>
            </div>
          </div>

          {/* Black Navigation Bar */}
          <nav className="w-full bg-[#1A1A1A] rounded-[2rem] flex justify-around items-center py-4 px-2 shadow-2xl pointer-events-auto">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'dashboard' ? 'text-[#E67E22]' : 'text-white/30'
              }`}
            >
              <Home className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={() => onTabChange('inventory')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'inventory' ? 'text-[#E67E22]' : 'text-white/30'
              }`}
            >
              <Search className="w-6 h-6" strokeWidth={3} />
            </button>

            {/* Empty space for the cutout/burger overlap */}
            <div className="flex-1" />

            <button
              onClick={() => onTabChange('recipes')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'recipes' ? 'text-[#E67E22]' : 'text-white/30'
              }`}
            >
              <Heart className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={() => onTabChange('more')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'more' ? 'text-[#E67E22]' : 'text-white/30'
              }`}
            >
              <Settings className="w-6 h-6" strokeWidth={3} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;
