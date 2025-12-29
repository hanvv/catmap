import React from 'react';
import { Text } from '@tarojs/components';

interface BadgeProps {
  text: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = 'bg-orange-100' }) => {
  return (
    <Text className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-[#5D4037] ${color} mr-2 mb-2 border border-[#5D4037]/10`}>
      {text}
    </Text>
  );
};
