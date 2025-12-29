import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { UserStats } from '../types';
import { Medal, Stamp, Award, PawPrint } from 'lucide-react';

interface JournalProps {
  stats: UserStats;
}

export const Journal: React.FC<JournalProps> = ({ stats }) => {
  return (
    <View className="h-full overflow-y-auto pb-32 no-scrollbar bg-[#FDFBF7]">
      {/* Header */}
      <View className="bg-[#5D4037] text-[#FDFBF7] pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <View className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Stamp size={200} />
        </View>

        <View className="relative z-10 flex items-center gap-4">
          <View className="w-20 h-20 rounded-full border-4 border-[#FDFBF7]/20 overflow-hidden bg-orange-200">
            <Image src="https://picsum.photos/200/200" className="w-full h-full object-cover" />
          </View>
          <View>
            <Text className="text-2xl font-bold font-rounded block">Meow Walker</Text>
            <View className="flex items-center gap-2 mt-1">
              <Text className="bg-[#FDFBF7]/20 px-3 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                Lv.5 {stats.level}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex justify-between mt-8 text-center">
          <View>
            <Text className="text-3xl font-bold font-rounded block">{stats.stamps}</Text>
            <Text className="text-xs opacity-70 uppercase tracking-wider block">Stamps</Text>
          </View>
          <View>
            <Text className="text-3xl font-bold font-rounded block">{stats.photos}</Text>
            <Text className="text-xs opacity-70 uppercase tracking-wider block">Photos</Text>
          </View>
          <View>
            <Text className="text-3xl font-bold font-rounded block">14</Text>
            <Text className="text-xs opacity-70 uppercase tracking-wider block">Days</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-6">
        <View className="mb-4 flex items-center gap-2">
          <Medal className="text-[#FF9F43]" />
          <Text className="text-[#5D4037] font-bold text-lg">My Badges</Text>
        </View>

        <View className="grid grid-cols-2 gap-4 mb-8">
          {stats.badges.map((badge, idx) => (
            <View key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                <Text>{idx === 0 ? '👮' : '🥫'}</Text>
              </View>
              <Text className="text-sm font-bold text-[#5D4037] leading-tight">{badge}</Text>
            </View>
          ))}
        </View>

        <View className="mb-4 flex items-center gap-2">
          <Award className="text-[#FF9F43]" />
          <Text className="text-[#5D4037] font-bold text-lg">Stamp Collection</Text>
        </View>

        <View className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <View key={i} className={`aspect-square rounded-xl flex items-center justify-center relative overflow-hidden group ${i <= 3 ? 'bg-white shadow-sm' : 'bg-gray-100 opacity-60'}`}>
              <View className="border-2 border-dashed border-gray-200 absolute inset-2 rounded-lg pointer-events-none"></View>
              {i <= 3 ? (
                <Image src={`https://picsum.photos/100/100?random=${i}`} className="w-full h-full object-cover p-2 rounded-2xl" />
              ) : (
                <PawPrint className="text-gray-300" />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};