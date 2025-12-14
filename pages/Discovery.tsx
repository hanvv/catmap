import React, { useEffect, useState } from 'react';
import { Camera, Search, X } from 'lucide-react';

interface DiscoveryProps {
  onClose: () => void;
}

export const Discovery: React.FC<DiscoveryProps> = ({ onClose }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => setActive(true));
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Dark Overlay */}
      <div 
        className={`absolute inset-0 bg-[#5D4037]/90 backdrop-blur-sm transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full px-8">
        <h2 className={`text-[#FDFBF7] text-2xl font-rounded font-bold mb-4 transition-all duration-500 delay-100 ${active ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          What did you find?
        </h2>

        <div className="flex gap-6 w-full justify-center">
          {/* Option A */}
          <button className={`flex flex-col items-center gap-3 transition-all duration-500 delay-200 ${active ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="w-24 h-24 bg-[#FF9F43] rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transform hover:scale-110 transition-transform">
              <Search size={40} className="text-white" />
            </div>
            <span className="text-[#FDFBF7] font-bold tracking-wide">New Cat</span>
          </button>

          {/* Option B */}
          <button className={`flex flex-col items-center gap-3 transition-all duration-500 delay-300 ${active ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="w-24 h-24 bg-[#2ED573] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transform hover:scale-110 transition-transform">
              <Camera size={40} className="text-white" />
            </div>
            <span className="text-[#FDFBF7] font-bold tracking-wide">Status Update</span>
          </button>
        </div>

        <button 
          onClick={onClose}
          className={`mt-12 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-all duration-500 delay-500 ${active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
