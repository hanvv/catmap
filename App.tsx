import React, { useState } from 'react';
import { ArtisticMap } from './components/Map/ArtisticMap';
import { Marker } from './components/Map/Marker';
import { BottomNav } from './components/Navigation/BottomNav';
import { CatBottomSheet } from './components/Sheet/CatBottomSheet';
import { Journal } from './pages/Journal';
import { Discovery } from './pages/Discovery';
import { MOCK_CATS, USER_STATS } from './constants';
import { Cat, ViewState } from './types';
import { Search, Filter, User } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('map');
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);

  // Initial loading state simulation
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDFBF7] text-[#5D4037]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FF9F43] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">🐱</div>
        </div>
        <p className="mt-4 font-rounded font-bold animate-pulse">Tracking paws...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      {/* Mobile Simulator Container */}
      <div className="w-full max-w-[400px] h-[850px] max-h-screen bg-[#FDFBF7] relative shadow-2xl overflow-hidden sm:rounded-[40px] border-[8px] border-gray-900 box-border ring-4 ring-gray-300">
        
        {/* Dynamic Content based on View */}
        {view === 'map' && (
          <>
            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
              <ArtisticMap />
              
              {/* Markers */}
              <div className="absolute inset-0 z-10">
                {MOCK_CATS.map((cat) => (
                  <Marker 
                    key={cat.id} 
                    cat={cat} 
                    onClick={setSelectedCat}
                    style={{ 
                      top: `${cat.lat}%`, 
                      left: `${cat.lng}%` 
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Floating Search Bar */}
            <div className="absolute top-12 left-4 right-4 z-20 flex items-center gap-3">
               <button 
                className="w-10 h-10 rounded-full bg-white shadow-soft-orange flex items-center justify-center overflow-hidden border-2 border-white"
                onClick={() => setView('journal')}
               >
                 <img src="https://picsum.photos/200/200" className="w-full h-full object-cover" alt="User" />
               </button>

               <div className="flex-1 h-12 bg-white rounded-full shadow-soft-orange flex items-center px-4 gap-2">
                 <Search size={18} className="text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Search: Orange Boss..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[#5D4037] placeholder-gray-400" 
                 />
               </div>

               <button className="w-12 h-12 rounded-full bg-white shadow-soft-orange flex items-center justify-center text-[#5D4037]">
                 <Filter size={20} />
               </button>
            </div>
            
            {/* Cat Sheet */}
            <CatBottomSheet 
              cat={selectedCat} 
              onClose={() => setSelectedCat(null)}
              onViewProfile={(cat) => console.log('View full profile', cat.name)}
            />
          </>
        )}

        {view === 'journal' && (
          <div className="absolute inset-0 z-0 animate-[fadeIn_0.3s_ease-out]">
            <Journal stats={USER_STATS} />
          </div>
        )}

        {/* Global Bottom Navigation */}
        <BottomNav 
          currentView={view} 
          onChangeView={(v) => {
            setView(v);
            setSelectedCat(null);
          }}
          onOpenDiscovery={() => setShowDiscovery(true)}
        />

        {/* Discovery Overlay Modal */}
        {showDiscovery && (
          <Discovery onClose={() => setShowDiscovery(false)} />
        )}

      </div>
    </div>
  );
}
