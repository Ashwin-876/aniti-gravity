
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Download, Flag, IndianRupee, Leaf, 
  TrendingUp, Sparkles, Box, PieChart, Info, BarChart3,
  Loader2, Brain, Calendar, TrendingDown, Award, Zap, Lightbulb, AlertCircle, Utensils, RefreshCw
} from 'lucide-react';
import { analyzeWastePatterns } from '../services/geminiService';

interface AnalyticsProps {
  onBack: () => void;
}

type TimeRange = 'Week' | 'Month' | 'Year';
type ActiveTab = 'Trends' | 'Consumption' | 'Achievement';

const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
  const [activeRange, setActiveRange] = useState<TimeRange>('Month');
  const [activeTab, setActiveTab] = useState<ActiveTab>('Trends');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const dataSets = {
    Week: {
      stats: [
        { label: 'MONEY SAVED', value: '₹1,240', sub: 'THIS WEEK', icon: IndianRupee, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#064E3B]' },
        { label: 'FOOD RESCUED', value: '4.2 lbs', sub: 'THIS WEEK', icon: Box, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#065F46]' },
        { label: 'CARBON REDUCED', value: '8.4 kg', sub: 'CO₂ EQUIVALENT', icon: Sparkles, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#064E3B]' },
        { label: 'WASTE REDUCTION', value: '15.2%', sub: '+1.2% VS LAST WEEK', icon: TrendingUp, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#065F46]' },
      ],
      chartData: [12, 15, 18, 14, 17, 19, 16],
      wasteData: [4, 6, 8, 3, 5, 2, 4],
      chartLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      categoryInsights: [
        { name: 'Dairy', consumed: 85, wasted: 15 },
        { name: 'Produce', consumed: 70, wasted: 30 },
        { name: 'Bakery', consumed: 90, wasted: 10 }
      ]
    },
    Month: {
      stats: [
        { label: 'MONEY SAVED', value: '₹5,200', sub: 'THIS MONTH', icon: IndianRupee, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#064E3B]' },
        { label: 'FOOD RESCUED', value: '18.5 lbs', sub: 'THIS MONTH', icon: Box, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#065F46]' },
        { label: 'CARBON REDUCED', value: '32.1 kg', sub: 'CO₂ EQUIVALENT', icon: Sparkles, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#064E3B]' },
        { label: 'WASTE REDUCTION', value: '22.4%', sub: '+5% VS LAST MONTH', icon: TrendingUp, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#065F46]' },
      ],
      chartData: [11, 13, 15, 14, 16, 17],
      wasteData: [4, 6, 2, 5, 1, 3],
      chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
      categoryInsights: [
        { name: 'Dairy', consumed: 82, wasted: 18 },
        { name: 'Produce', consumed: 65, wasted: 35 },
        { name: 'Bakery', consumed: 88, wasted: 12 }
      ]
    },
    Year: {
      stats: [
        { label: 'MONEY SAVED', value: '₹62,400', sub: 'YEAR TO DATE', icon: IndianRupee, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#064E3B]' },
        { label: 'FOOD RESCUED', value: '220 lbs', sub: 'YEAR TO DATE', icon: Box, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#065F46]' },
        { label: 'CARBON REDUCED', value: '410 kg', sub: 'CO₂ EQUIVALENT', icon: Sparkles, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#064E3B]' },
        { label: 'WASTE REDUCTION', value: '34%', sub: '+12% VS 2024', icon: TrendingUp, color: 'text-[#4CAF50]', bg: 'bg-[#E8F5E9]', boxBg: 'bg-[#065F46]' },
      ],
      chartData: [13, 14, 12, 15, 17, 18, 16, 15, 17, 19, 17, 13],
      wasteData: [5, 6, 7, 4, 3, 2, 6, 5, 4, 3, 4, 5],
      chartLabels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      categoryInsights: [
        { name: 'Dairy', consumed: 80, wasted: 20 },
        { name: 'Produce', consumed: 72, wasted: 28 },
        { name: 'Bakery', consumed: 92, wasted: 8 }
      ]
    }
  };

  const currentData = useMemo(() => dataSets[activeRange], [activeRange]);

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    const summary = {
      range: activeRange,
      wasteAvg: currentData.wasteData.reduce((a, b) => a + b, 0) / currentData.wasteData.length,
      categories: currentData.categoryInsights
    };
    const insight = await analyzeWastePatterns([summary]);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  useEffect(() => {
    if (activeTab === 'Consumption' && !aiInsight) {
      fetchAiAnalysis();
    }
  }, [activeTab]);

  const renderTrends = () => {
    const maxVal = 20;
    // For Year view we need thinner bars to fit, for Month/Week we use thicker ones
    const barWidth = activeRange === 'Year' ? 'w-[6px]' : 'w-[10px]';
    const groupGap = activeRange === 'Year' ? 'gap-0.5' : 'gap-1';

    return (
      <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 px-1">{activeRange}ly Trends</h3>
        <div className="flex gap-6 mb-8 px-1">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#1B8040] rounded-[2px]" />
            <span className="text-xs font-bold text-gray-400">Food Saved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#FF8C33] rounded-[2px]" />
            <span className="text-xs font-bold text-gray-400">Food Wasted</span>
          </div>
        </div>
        <div className="relative h-72 w-full flex items-end justify-between px-2 pt-10 border-b border-gray-100 pb-2">
          {currentData.chartLabels.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
              <div className={`relative h-full flex items-end justify-center ${groupGap}`}>
                <div 
                  className={`${barWidth} bg-[#1B8040] rounded-t-[1px] transition-all duration-700 hover:brightness-110`} 
                  style={{ height: `${(currentData.chartData[i] / maxVal) * 100}%` }} 
                />
                <div 
                  className={`${barWidth} bg-[#FF8C33] rounded-t-[1px] transition-all duration-700 hover:brightness-110`} 
                  style={{ height: `${(currentData.wasteData[i] / maxVal) * 100}%` }} 
                />
              </div>
              <span className="text-[10px] font-bold text-gray-300 tracking-tight uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConsumption = () => (
    <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-2xl font-bold text-gray-800">Consumption Insights</h3>
        <button onClick={fetchAiAnalysis} disabled={loadingAi} className="p-2 bg-gray-50 rounded-full text-[#4CAF50] active:scale-95 transition-all">
          <RefreshCw className={`w-5 h-5 ${loadingAi ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-[#064E3B] to-[#065F46] rounded-[2.5rem] p-7 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Brain className="w-24 h-24" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-100">Smart Analysis</span>
          </div>
          {loadingAi ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm font-bold opacity-80">Gemini is analyzing your patterns...</p>
            </div>
          ) : (
            <p className="text-lg font-bold leading-snug">
              {aiInsight || "Tap the refresh button to generate personalized consumption insights using AI."}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] px-2">Category Breakdown</h4>
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-6 space-y-6">
          {currentData.categoryInsights.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                <span className="text-[10px] font-black text-gray-400">{cat.consumed}% Used • {cat.wasted}% Wasted</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-[#4CAF50]" style={{ width: `${cat.consumed}%` }} />
                <div className="h-full bg-[#FF7F1E]" style={{ width: `${cat.wasted}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] px-2">Top Recommendation</h4>
        <div className="bg-[#FFF8E1] border-2 border-yellow-100 rounded-[2.5rem] p-6 flex gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-relaxed">
              You frequently waste Produce. Consider using the "Smart Recipes" feature more often to use up greens before they expire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievement = () => (
    <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 px-1">Recent Badges</h3>
      {[
        { title: 'Waste Warrior', desc: 'Reduced meat waste by 50% this week', date: '2 DAYS AGO', icon: Award, bg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
        { title: 'Climate Hero', desc: 'Saved 10kg of CO2 by composting', date: '1 WEEK AGO', icon: Sparkles, bg: 'bg-blue-50', iconColor: 'text-blue-400' },
        { title: 'Budget Master', desc: 'Stayed 20% under grocery budget', date: 'OCT 2023', icon: IndianRupee, bg: 'bg-green-50', iconColor: 'text-green-600' },
      ].map((badge, idx) => (
        <div key={idx} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
          <div className={`${badge.bg} ${badge.iconColor} w-16 h-16 rounded-full flex items-center justify-center shrink-0`}>
            <badge.icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-800">{badge.title}</h4>
            <p className="text-sm font-bold text-gray-400 leading-tight mt-1">{badge.desc}</p>
          </div>
          <div className="text-[10px] font-bold text-gray-300 uppercase whitespace-nowrap self-start mt-1">{badge.date}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[150] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
      <header className="px-6 py-6 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 -ml-2 active:scale-90 transition-transform">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        </div>
        <div className="flex gap-4">
          <Download className="w-6 h-6 text-gray-800" />
          <Flag className="w-6 h-6 text-gray-800" />
        </div>
      </header>

      <div className="px-6 py-2">
        <div className="bg-gray-50/50 p-1 rounded-2xl flex gap-1 border border-gray-100">
          {(['Week', 'Month', 'Year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                activeRange === range ? 'bg-[#1B8040] text-white shadow-md' : 'text-gray-400'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 space-y-6 pb-20">
        <div className="grid grid-cols-2 gap-4 mt-8">
          {currentData.stats.map((stat, i) => (
            <div key={i} className={`${stat.boxBg} p-5 rounded-[2.5rem] flex flex-col items-center relative shadow-xl h-52`}>
              <div className="flex items-center gap-2 mb-8">
                <div className={`${stat.bg} ${stat.color} p-2 rounded-full flex items-center justify-center shadow-inner`}>
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="bg-white rounded-[1.8rem] w-full p-6 text-center shadow-lg flex flex-col justify-center flex-1">
                <div className="text-2xl font-black text-[#1A1A1A] tracking-tight">{stat.value}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase mt-1.5 tracking-wider">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex border-b border-gray-100 pt-8">
          {(['Trends', 'Consumption', 'Achievement'] as ActiveTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab ? 'text-[#1B8040]' : 'text-gray-400'
              }`}
            >
              {tab === 'Consumption' ? 'Insights' : tab}
              {activeTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#1B8040] rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === 'Trends' && renderTrends()}
        {activeTab === 'Consumption' && renderConsumption()}
        {activeTab === 'Achievement' && renderAchievement()}
      </div>
    </div>
  );
};

export default Analytics;
