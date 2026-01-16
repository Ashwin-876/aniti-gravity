
import React, { useState, useEffect } from 'react';
import { 
  Utensils, Sparkles, Clock, ChevronRight, ChevronLeft, 
  Volume2, Timer, Filter, Apple, User, X, Check, ArrowLeft,
  Flame, Droplet, Soup, Loader2, Search, BrainCircuit, ChefHat, ImageIcon
} from 'lucide-react';
import { FoodItem } from '../types';
import { getRecipeSuggestions, generateHighQualityImage } from '../services/geminiService';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  calories?: string;
  image?: string;
}

interface RecipeGeneratorProps {
  inventory: FoodItem[];
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ inventory }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  
  const [filters, setFilters] = useState({ 
    cuisine: '', 
    diet: 'Any', 
    maxCalories: 'Any', 
    maxTime: 'Any' 
  });

  const fetchRecipes = async () => {
    setLoading(true);
    const contextItems = isBrainstorming 
      ? [...inventory, { name: customIngredients } as any] 
      : inventory;
    
    const extendedFilters = {
      ...filters,
      additionalContext: isBrainstorming ? `Focus on using these specific extra ingredients: ${customIngredients}.` : ''
    };

    const suggested = await getRecipeSuggestions(contextItems, extendedFilters);
    setRecipes(suggested);
    setLoading(false);
  };

  useEffect(() => {
    if (!isBrainstorming) fetchRecipes();
  }, [filters, isBrainstorming]);

  const startCooking = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setCurrentStep(0);
  };

  const handleGenerateRecipeImage = async (index: number, title: string) => {
    setGeneratingImages(prev => ({ ...prev, [index]: true }));
    const img = await generateHighQualityImage(title, "1:1");
    if (img) {
      setRecipes(prev => prev.map((r, i) => i === index ? { ...r, image: img } : r));
    }
    setGeneratingImages(prev => ({ ...prev, [index]: false }));
  };

  const speakStep = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  if (activeRecipe) {
    return (
      <div className="fixed inset-0 bg-[#FDFCF0] z-[160] flex flex-col animate-in fade-in slide-in-from-bottom duration-500">
        <header className="px-6 py-6 flex items-center justify-between border-b border-[#F0F0F0] bg-white">
          <button onClick={() => setActiveRecipe(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-400" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-800 line-clamp-1">{activeRecipe.title}</h2>
            <p className="text-[10px] font-bold text-[#4CAF50] uppercase tracking-wider">Step {currentStep + 1} of {activeRecipe.instructions.length}</p>
          </div>
          <button onClick={() => speakStep(activeRecipe.instructions[currentStep])} className="p-2 bg-[#E8F5E9] text-[#4CAF50] rounded-full">
            <Volume2 className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 px-8 py-12 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 bg-[#E8F5E9] rounded-[2rem] flex items-center justify-center mb-4">
             <Utensils className="w-12 h-12 text-[#4CAF50]" />
          </div>
          
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
            <p className="text-2xl font-bold text-gray-800 leading-tight">
              {activeRecipe.instructions[currentStep]}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-8">
            <button className="flex items-center gap-2 bg-white border-2 border-[#F0F0F0] px-4 py-2 rounded-2xl text-xs font-bold text-gray-500">
              <Timer className="w-4 h-4" /> Start Timer
            </button>
            <button className="flex items-center gap-2 bg-white border-2 border-[#F0F0F0] px-4 py-2 rounded-2xl text-xs font-bold text-gray-500">
              <Sparkles className="w-4 h-4 text-[#FFC107]" /> Substitution
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 gap-4 border-t border-[#F0F0F0] bg-white safe-area-bottom">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="w-full bg-white border-2 border-[#F0F0F0] py-4 rounded-3xl flex items-center justify-center gap-2 font-bold text-gray-400 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          {currentStep === activeRecipe.instructions.length - 1 ? (
             <button 
              onClick={() => setActiveRecipe(null)}
              className="w-full bg-[#4CAF50] text-white py-4 rounded-3xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-100"
            >
              <Check className="w-5 h-5" /> Finish
            </button>
          ) : (
            <button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="w-full bg-[#4CAF50] text-white py-4 rounded-3xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-100"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFCF0] pb-32 no-scrollbar overflow-y-auto px-6 animate-in fade-in duration-500">
      <header className="pt-6 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Smart Chef</h1>
          <div className="flex items-center gap-1.5 bg-[#F0F0F0]/50 px-2 py-1 rounded-full">
            <span className="text-lg">🍔</span>
            <Search className="w-4 h-4 text-gray-800" strokeWidth={3} />
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-400 mt-1">AI-suggested recipes from your pantry</p>
      </header>

      {/* Mode Selector */}
      <div className="bg-[#F0F0F0]/50 rounded-full p-1.5 flex mb-8 shadow-sm">
        <button 
          onClick={() => setIsBrainstorming(false)}
          className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${!isBrainstorming ? 'bg-[#4CAF50] text-white shadow-lg' : 'text-gray-400'}`}
        >
          My Inventory
        </button>
        <button 
          onClick={() => setIsBrainstorming(true)}
          className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isBrainstorming ? 'bg-[#4CAF50] text-white shadow-lg' : 'text-gray-400'}`}
        >
          Smart Brainstorm
        </button>
      </div>

      {isBrainstorming && (
        <div className="space-y-4 mb-6 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-white rounded-[2rem] border-2 border-[#F0F0F0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="text-sm font-bold text-gray-800">What's on your mind?</h3>
            </div>
            <textarea 
              value={customIngredients}
              onChange={(e) => setCustomIngredients(e.target.value)}
              placeholder="e.g. I have some leftover pasta and a bell pepper..."
              className="w-full bg-[#FDFCF0] border-2 border-[#F0F0F0] rounded-2xl p-4 text-sm font-semibold text-gray-700 outline-none focus:border-[#4CAF50] h-24 resize-none"
            />
            <button 
              onClick={fetchRecipes}
              className="w-full bg-[#4CAF50] text-white py-4 rounded-[1.5rem] font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5" /> Brainstorm Recipes
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="space-y-5 mb-8">
        <div className="flex items-center gap-2 px-1">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.15em]">Advanced Filters</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border-2 border-[#F0F0F0] rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Any Diet</span>
          </div>
          <div className="bg-white border-2 border-[#F0F0F0] rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Any Time</span>
          </div>
          <div className="bg-white border-2 border-[#F0F0F0] rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Any Calories</span>
          </div>
          <div className="bg-white border-2 border-[#F0F0F0] rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">Any Cuisine</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin" />
            <p className="text-sm font-bold text-gray-400">AI is brainstorming recipes...</p>
          </div>
        ) : recipes.length > 0 ? (
          recipes.map((recipe, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-[2.5rem] border-2 border-[#F9F9F9] overflow-hidden shadow-sm hover:border-[#E8F5E9] transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {recipe.image && (
                <div className="w-full h-48 overflow-hidden">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-7">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{recipe.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" /> {recipe.prepTime}
                      </div>
                      {recipe.calories && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          <Flame className="w-3 h-3 text-orange-400" /> {recipe.calories}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] font-black text-[#4CAF50] uppercase tracking-tighter">
                        <Sparkles className="w-3 h-3" /> Easy
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <div className="w-16 h-16 bg-[#FDFCF0] rounded-2xl flex items-center justify-center border border-[#F0F0F0] shadow-sm">
                      <div className="bg-[#E8F5E9] p-3 rounded-xl">
                        <Utensils className="w-7 h-7 text-[#4CAF50]" />
                      </div>
                    </div>
                    <button 
                      onClick={() => handleGenerateRecipeImage(idx, recipe.title)}
                      className="w-14 h-8 bg-[#4CAF50] text-white rounded-xl shadow-lg active:scale-95 transition-all hover:bg-[#43a047] flex items-center justify-center"
                      disabled={generatingImages[idx]}
                    >
                      {generatingImages[idx] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] px-1">Key Ingredients</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.slice(0, 4).map((ing, i) => (
                      <span key={i} className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-600 border border-gray-100/50">{ing}</span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="text-[10px] font-black text-gray-300 px-1">+{recipe.ingredients.length - 4} more</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => startCooking(recipe)}
                  className="w-full bg-[#E8F5E9] text-[#4CAF50] py-4.5 rounded-full flex items-center justify-center gap-2 font-black text-[13px] uppercase tracking-widest group-hover:bg-[#4CAF50] group-hover:text-white transition-all shadow-sm active:scale-95"
                >
                  Start Cooking <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-200" />
             </div>
             <p className="text-sm font-bold text-gray-400">No recipes found. Try adjusting your filters or brainstorming something specific!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;
