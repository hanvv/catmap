import React from 'react';
import { UserStats } from '../types';
import { Medal, Stamp, Award, PawPrint } from 'lucide-react';

interface JournalProps {
  stats: UserStats;
}

export const Journal: React.FC<JournalProps> = ({ stats }) => {
  return (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-[#FDFBF7]">
      {/* Header */}
      <div className="bg-[#5D4037] text-[#FDFBF7] pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Stamp size={200} />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-[#FDFBF7]/20 overflow-hidden bg-orange-200">
             <img src="https://picsum.photos/200/200" alt="User" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-rounded">Meow Walker</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#FDFBF7]/20 px-3 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                Lv.5 {stats.level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8 text-center">
          <div>
            <div className="text-3xl font-bold font-rounded">{stats.stamps}</div>
            <div className="text-xs opacity-70 uppercase tracking-wider">Stamps</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-rounded">{stats.photos}</div>
            <div className="text-xs opacity-70 uppercase tracking-wider">Photos</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-rounded">14</div>
            <div className="text-xs opacity-70 uppercase tracking-wider">Days</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-[#5D4037] font-bold text-lg mb-4 flex items-center gap-2">
          <Medal className="text-[#FF9F43]" />
          My Badges
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.badges.map((badge, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                {idx === 0 ? '👮' : '🥫'}
              </div>
              <span className="text-sm font-bold text-[#5D4037] leading-tight">{badge}</span>
            </div>
          ))}
        </div>

        <h3 className="text-[#5D4037] font-bold text-lg mb-4 flex items-center gap-2">
          <Award className="text-[#FF9F43]" />
          Stamp Collection
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center relative overflow-hidden group ${i <= 3 ? 'bg-white shadow-sm' : 'bg-gray-100 opacity-60'}`}>
              <div className="border-2 border-dashed border-gray-200 absolute inset-2 rounded-lg pointer-events-none"></div>
              {i <= 3 ? (
                <img src={`https://picsum.photos/100/100?random=${i}`} className="w-full h-full object-cover p-2 rounded-2xl" alt="stamp" />
              ) : (
                <PawPrint className="text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};