/**
 * 发现页面组件
 * 点击猫爪按钮后弹出的选项页面
 */

import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';

interface DiscoveryProps {
  onClose: () => void;
}

export const Discovery: React.FC<DiscoveryProps> = ({ onClose }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="absolute inset-0 z-50 flex items-center justify-center">
      {/* 深色遮罩层 */}
      <View
        className={`absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(93, 64, 55, 0.9)' }}
        onClick={onClose}
      />

      {/* 内容区域 */}
      <View className="relative z-10 flex flex-col items-center gap-8 w-full px-8">
        {/* 标题 */}
        <Text
          className={`text-2xl font-bold mb-4 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: '#FDFBF7' }}
        >
          What did you find?
        </Text>

        {/* 选项按钮区域 */}
        <View className="flex gap-8 w-full justify-center">
          {/* 新猫咪选项 */}
          <View
            className={`flex flex-col items-center gap-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
          >
            <View
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#FF9F43',
                boxShadow: '0 4px 15px rgba(255, 159, 67, 0.3)'
              }}
            >
              <Text className="text-4xl">🔍</Text>
            </View>
            <Text className="font-bold" style={{ color: '#FDFBF7' }}>New Cat</Text>
          </View>

          {/* 状态更新选项 */}
          <View
            className={`flex flex-col items-center gap-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
          >
            <View
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#2ED573',
                boxShadow: '0 4px 15px rgba(46, 213, 115, 0.3)'
              }}
            >
              <Text className="text-4xl">📸</Text>
            </View>
            <Text className="font-bold" style={{ color: '#FDFBF7' }}>Status Update</Text>
          </View>
        </View>

        {/* 关闭按钮 */}
        <View
          onClick={onClose}
          className={`mt-12 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Text className="text-2xl" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>✕</Text>
        </View>
      </View>
    </View>
  );
};
