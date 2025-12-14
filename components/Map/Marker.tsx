import React from 'react';
import { Cat } from '../../types';

interface MarkerProps {
  cat: Cat;
  onClick: (cat: Cat) => void;
  style: React.CSSProperties;
}

export const Marker: React.FC<MarkerProps> = ({ cat, onClick, style }) => {
  const statusColor = {
    active: 'bg-green-500',
    sleeping: 'bg-gray-400',
    hidden: 'bg-yellow-400'
  };

  return (
    <div 
      className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95 group"
      style={style}
      onClick={() => onClick(cat)}
    >
      <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
        {/* The Marker Body */}
        <div className="w-14 h-14 rounded-full border-4 border-white bg-white shadow-soft-orange overflow-hidden relative box-border ring-2 ring-[#FF9F43]">
          <img src={cat.avatar} alt={cat.name} className="w-full h-full object-cover" />
        </div>
        
        {/* Status Dot */}
        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusColor[cat.status]}`} />
      </div>
      
      {/* Name Label (Shows on hover or always if desired) */}
      <div className="mt-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-orange-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-[#5D4037]">{cat.name}</span>
      </div>
    </div>
  );
};
