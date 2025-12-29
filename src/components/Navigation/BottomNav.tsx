import React from 'react';
import { View, Text, Button } from '@tarojs/components'; // Imports from taro
import { Compass, Book, PawPrint } from 'lucide-react';
import { TabItem, ViewState } from '../../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenDiscovery: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView, onOpenDiscovery }) => {
  const tabs: TabItem[] = [
    { id: 'map', icon: <Compass size={24} />, label: 'Explore' },
    { id: 'journal', icon: <Book size={24} />, label: 'Journal' },
  ];

  return (
    <View className="absolute bottom-8 left-0 right-0 px-6 z-30 pointer-events-none">
      <View className="bg-white/95 backdrop-blur-md rounded-full shadow-float h-16 flex items-center justify-between px-2 max-w-[320px] mx-auto pointer-events-auto relative">

        {/* Left Tab */}
        <View
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${currentView === 'map' ? 'text-[#FF9F43]' : 'text-gray-400'}`}
          onClick={() => onChangeView('map')}
        >
          {tabs[0].icon}
          <Text className="text-[10px] font-bold">{tabs[0].label}</Text>
        </View>

        {/* Center Action Button (Floating) */}
        <View className="relative -top-6 w-16 h-16">
          <View
            className="absolute inset-0 bg-[#FF9F43] rounded-full shadow-soft-orange flex items-center justify-center text-white transform transition-transform hover:scale-105 active:scale-95 group"
            onClick={onOpenDiscovery}
          >
            <PawPrint size={28} fill="currentColor" className="opacity-90 group-hover:rotate-12 transition-transform" />
          </View>
        </View>

        {/* Right Tab */}
        <View
          className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${currentView === 'journal' ? 'text-[#FF9F43]' : 'text-gray-400'}`}
          onClick={() => onChangeView('journal')}
        >
          {tabs[1].icon}
          <Text className="text-[10px] font-bold">{tabs[1].label}</Text>
        </View>

      </View>
    </View>
  );
};
