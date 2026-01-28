/**
 * 底部导航栏组件
 * 胶囊状设计：白色圆角胶囊 + 中间突出的橙色猫爪按钮
 */

import React from 'react';
import { View, Text } from '@tarojs/components';
import { ViewState } from '../../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenDiscovery: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView, onOpenDiscovery }) => {
  return (
    <View
      className="absolute left-0 right-0 z-30 flex justify-center"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      {/* 胶囊状容器 */}
      <View
        className="relative flex items-center bg-white px-4"
        style={{
          borderRadius: '40px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          height: '64px',
          minWidth: '280px'
        }}
      >
        {/* 左侧 - Explore */}
        <View
          className="flex-1 flex flex-col items-center justify-center py-2"
          onClick={() => onChangeView('map')}
        >
          <View
            className="w-7 h-7 rounded-full flex items-center justify-center mb-1"
            style={{
              border: currentView === 'map' ? '2px solid #FF9F43' : '2px solid transparent'
            }}
          >
            <Text style={{ fontSize: '16px', color: currentView === 'map' ? '#FF9F43' : '#9CA3AF' }}>🧭</Text>
          </View>
          <Text
            style={{
              fontSize: '11px',
              color: currentView === 'map' ? '#FF9F43' : '#9CA3AF',
              fontWeight: currentView === 'map' ? '600' : '400'
            }}
          >
            Explore
          </Text>
        </View>

        {/* 中间 - 猫爪按钮（突出显示） */}
        <View
          className="flex items-center justify-center"
          style={{ marginTop: '-24px' }}
        >
          <View
            className="rounded-full flex items-center justify-center"
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#FF9F43',
              boxShadow: '0 4px 15px rgba(255, 159, 67, 0.4)'
            }}
            onClick={onOpenDiscovery}
          >
            <Text style={{ fontSize: '28px' }}>🐾</Text>
          </View>
        </View>

        {/* 右侧 - Journal */}
        <View
          className="flex-1 flex flex-col items-center justify-center py-2"
          onClick={() => onChangeView('journal')}
        >
          <View
            className="w-7 h-7 rounded-full flex items-center justify-center mb-1"
            style={{
              border: currentView === 'journal' ? '2px solid #FF9F43' : '2px solid transparent'
            }}
          >
            <Text style={{ fontSize: '16px', color: currentView === 'journal' ? '#FF9F43' : '#9CA3AF' }}>📓</Text>
          </View>
          <Text
            style={{
              fontSize: '11px',
              color: currentView === 'journal' ? '#FF9F43' : '#9CA3AF',
              fontWeight: currentView === 'journal' ? '600' : '400'
            }}
          >
            Journal
          </Text>
        </View>
      </View>
    </View>
  );
};
