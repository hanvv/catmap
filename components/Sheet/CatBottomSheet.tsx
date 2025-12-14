import React, { useState } from 'react';
import { Cat } from '../../types';
import { Badge } from '../UI/Badge';
import { Navigation, Heart, MapPin, X } from 'lucide-react';

interface CatBottomSheetProps {
  cat: Cat | null;
  onClose: () => void;
  onViewProfile: (cat: Cat) => void;
}

export const CatBottomSheet: React.FC<CatBottomSheetProps> = ({ cat, onClose, onViewProfile }) => {
  const [isLiked, setIsLiked] = useState(false);

  if (!cat) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full bg-[#FDFBF7] rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-24 pointer-events-auto transform transition-transform duration-300 animate-[slideUp_0.3s_ease-out]">
        
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 opacity-50" />

        <div className="flex gap-4">
          {/* Hero Image */}
          <div className="shrink-0" onClick={() => onViewProfile(cat)}>
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-white">
              <img src={cat.avatar} alt={cat.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-rounded text-[#5D4037] flex items-center gap-2">
                {cat.name}
                <span className="text-sm bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">♀</span>
              </h2>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-2 flex flex-wrap">
              {cat.badges.map((badge, idx) => (
                <Badge key={idx} text={badge} />
              ))}
            </div>

            <div className="mt-2 text-sm text-gray-500 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Heart size={14} className="text-red-400 fill-current" />
                <span>Friendliness:</span>
                <span className="text-orange-400 tracking-widest">
                  {'★'.repeat(cat.friendliness)}{'☆'.repeat(5 - cat.friendliness)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-blue-400" />
                <span>{cat.distance}m away</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex items-center gap-3">
          <button className="flex-1 bg-[#FF9F43] text-white font-bold py-3.5 rounded-2xl shadow-soft-orange active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Navigation size={20} fill="currentColor" />
            Take me there
          </button>
          
          <button 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400'}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={`transition-transform ${isLiked ? 'scale-125' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
