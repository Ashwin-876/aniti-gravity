
import React, { useState } from 'react';
import { ArrowLeft, Plus, Sparkles, PlusCircle, ShoppingCart, BarChart3, X } from 'lucide-react';
import { FoodItem } from '../types';

interface ShoppingListProps {
  onBack: () => void;
  urgentItems: FoodItem[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ onBack, urgentItems }) => {
  const [list, setList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addItem = (item: string) => {
    if (!list.includes(item)) {
      setList(prev => [...prev, item]);
    }
  };

  const removeItem = (index: number) => {
    setList(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h2 className="text-xl font-black text-[#2ECC71]">Expronix</h2>
        </div>
        <BarChart3 className="w-6 h-6 text-gray-300" />
      </header>

      <div className="px-6 space-y-2">
        <h1 className="text-3xl font-black text-[#1A2E35]">Shopping List</h1>
        <p className="text-sm font-bold text-gray-300">Replenish your pantry essentials</p>
      </div>

      <div className="px-6 mt-8 flex gap-3">
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center">
          <input 
            type="text" 
            placeholder="What do you need?" 
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-600 placeholder-gray-300"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                addItem(inputValue.trim());
                setInputValue('');
              }
            }}
          />
        </div>
        <button 
          onClick={() => {
            if (inputValue.trim()) {
              addItem(inputValue.trim());
              setInputValue('');
            }
          }}
          className="w-14 h-14 bg-[#2ECC71] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* Auto Suggestions Section */}
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-6 space-y-6">
          <div className="flex items-center gap-2 text-[#2ECC71]">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Auto-Suggestions</span>
          </div>
          
          <div className="space-y-3">
            {urgentItems.length > 0 ? urgentItems.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="bg-[#2ECC71]/5 p-4 rounded-2xl flex justify-between items-center group cursor-pointer active:bg-[#2ECC71]/10 transition-colors"
                onClick={() => addItem(item.name)}
              >
                <div>
                  <h4 className="text-sm font-black text-[#1A2E35]">{item.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">Expiring Soon</p>
                </div>
                <PlusCircle className="w-5 h-5 text-[#2ECC71] opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            )) : (
              <p className="text-xs text-center text-gray-400 font-bold py-4">No suggestions available</p>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[250px] text-center">
          {list.length === 0 ? (
            <>
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-10 h-10 text-gray-100" />
              </div>
              <p className="text-sm font-bold text-gray-300">Your shopping list is empty</p>
            </>
          ) : (
            <div className="w-full space-y-3">
              {list.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between w-full bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-700">{item}</span>
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
