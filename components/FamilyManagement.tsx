
import React, { useState } from 'react';
import { 
  ChevronLeft, Plus, AlertCircle, Heart, FileText, Bell, 
  UserPlus, MoreVertical, ShieldAlert, CheckCircle2, 
  Activity, Thermometer, User
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  allergies: string[];
  conditions: string[];
  severity: 'low' | 'medium' | 'high';
}

interface FamilyManagementProps {
  onBack: () => void;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({ onBack }) => {
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'John Doe',
      role: 'Father (Admin)',
      allergies: ['Peanuts', 'Shellfish'],
      conditions: ['Hypertension'],
      severity: 'high'
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Mother',
      allergies: ['Gluten'],
      conditions: ['None'],
      severity: 'medium'
    }
  ]);

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-[130] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 bg-gray-50 rounded-full active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </button>
        <h2 className="text-xl font-black text-[#1A2E35] tracking-tight uppercase">Family Hub</h2>
        <div className="flex gap-2">
           <button className="p-2 bg-gray-50 rounded-full text-gray-400">
             <Bell className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar pb-32">
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
             <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em]">Health Profiles</h3>
             <span className="text-[10px] font-bold text-[#2ECC71] bg-[#2ECC71]/10 px-2 py-0.5 rounded-full uppercase">Shared Data</span>
           </div>

           {members.map((member) => (
             <div key={member.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border-2 border-white shadow-inner">
                         <User className="w-7 h-7" />
                      </div>
                      <div>
                         <h4 className="font-black text-[#1A2E35] text-lg">{member.name}</h4>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{member.role}</p>
                      </div>
                   </div>
                   <button className="p-2 text-gray-300"><MoreVertical className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   {/* Allergies */}
                   <div className="bg-red-50/50 p-4 rounded-3xl border border-red-50 space-y-2">
                      <div className="flex items-center gap-2 text-red-500">
                         <ShieldAlert className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Allergies</span>
                      </div>
                      <p className="text-xs font-bold text-red-700/80 leading-relaxed">
                        {member.allergies.join(', ') || 'None reported'}
                      </p>
                   </div>

                   {/* Conditions */}
                   <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-50 space-y-2">
                      <div className="flex items-center gap-2 text-blue-500">
                         <Heart className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Health</span>
                      </div>
                      <p className="text-xs font-bold text-blue-700/80 leading-relaxed">
                        {member.conditions.join(', ') || 'Healthy'}
                      </p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${member.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                         {member.severity === 'high' ? <Activity className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {member.severity === 'high' ? 'High Risk Member' : 'Low Risk Member'}
                      </span>
                   </div>
                   <button className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-tight">
                      <FileText className="w-3.5 h-3.5" /> Emergency Card
                   </button>
                </div>
             </div>
           ))}
        </section>

        <section className="space-y-4">
           <h3 className="text-[11px] font-black uppercase text-gray-400 px-2 tracking-[0.2em]">Safety Settings</h3>
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-2 overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-[2rem] transition-colors cursor-pointer group">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-2xl group-hover:bg-white transition-colors">
                       <ShieldAlert className="w-5 h-5 text-[#2ECC71]" />
                    </div>
                    <div>
                       <span className="text-sm font-black text-[#1A2E35] tracking-tight">Allergy-Safe Scanning</span>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Alert if product contains family allergens</p>
                    </div>
                 </div>
                 <div className="w-10 h-5 bg-[#2ECC71] rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-[2rem] transition-colors cursor-pointer group">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-white transition-colors">
                       <Bell className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                       <span className="text-sm font-black text-[#1A2E35] tracking-tight">Shared Shopping List</span>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Collaborate with household members</p>
                    </div>
                 </div>
                 <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* Footer Button */}
      <div className="p-8 bg-gradient-to-t from-[#F9FAFB] to-transparent safe-area-bottom fixed bottom-0 left-0 right-0 max-w-md mx-auto z-140">
        <button className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 group">
          <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
             <Plus className="w-6 h-6" />
          </div>
          <span className="font-black text-[13px] uppercase tracking-[0.2em]">Add Family Member</span>
        </button>
      </div>
    </div>
  );
};

export default FamilyManagement;
