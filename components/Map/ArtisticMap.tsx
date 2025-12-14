import React from 'react';

// This simulates a custom map style without needing an external API key or library for the demo.
// It creates the "Picture Book" aesthetic described.
export const ArtisticMap: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#f2efe4] overflow-hidden pointer-events-none z-0">
      {/* Water */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-[#e0f7fa] opacity-60 rounded-l-[100px] transform skew-x-12 translate-x-20"></div>
      
      {/* Parks */}
      <div className="absolute top-[10%] left-[10%] w-40 h-40 bg-[#dcedc8] rounded-full opacity-70 blur-xl"></div>
      <div className="absolute bottom-[20%] right-[30%] w-60 h-60 bg-[#dcedc8] rounded-full opacity-70 blur-2xl"></div>

      {/* Roads (SVG Overlay) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
        <path d="M-10,100 Q150,120 300,50 T600,100" stroke="#5D4037" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M-10,300 Q100,280 200,350 T500,320" stroke="#5D4037" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M100,-10 Q120,200 80,400 T150,800" stroke="#5D4037" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M300,-10 Q280,150 350,300 T320,800" stroke="#5D4037" strokeWidth="18" fill="none" strokeLinecap="round" />
      </svg>
      
      {/* Buildings/Landmarks (Abstract Shapes) */}
      <div className="absolute top-32 left-8 w-16 h-12 bg-[#ffe0b2] rounded-lg transform rotate-6 border-2 border-[#5d4037]/10"></div>
      <div className="absolute top-64 right-12 w-20 h-24 bg-[#ffccbc] rounded-xl transform -rotate-3 border-2 border-[#5d4037]/10"></div>
      <div className="absolute bottom-40 left-24 w-14 h-14 bg-[#e1bee7] rounded-full border-2 border-[#5d4037]/10"></div>
    </div>
  );
};
