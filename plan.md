# CatMap 真实地图功能实现计划

## 需求概述

在保留现有"绘本风格"的基础上，集成真实地理位置功能：
- 用户位置定位
- 基于用户位置生成附近 Mock 猫咪数据
- 显示真实地图 + 风格化滤镜
- 点击猫咪显示详情并支持导航

---

## 设计决策

| 决策项 | 选择 |
|--------|------|
| 默认位置 | 上海田子坊区域 |
| 猫咪数据生成 | 每次打开重新生成（随机位置） |
| 功能优先级 | 全部功能（显示位置、列表、详情卡片、导航、刷新） |
| 覆盖层透明度 | 50% |
| 刷新按钮位置 | 右下角 |
| 详情卡片 | 复用现有 CatBottomSheet |

---

## 实现方案概览

```
用户打开应用
    ↓
获取用户位置 (wx.getLocation)
    ↓
用户拒绝 → 使用上海默认位置
    ↓
生成附近猫咪数据 (基于用户位置随机偏移)
    ↓
显示真实地图 + 绘本风格滤镜 + 猫咪标记点
    ↓
用户操作：查看详情、导航、刷新列表
```

---

## 文件变更计划

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types.ts` | 修改 | 添加地理位置相关类型 |
| `src/services/location.ts` | 新建 | 位置服务模块 |
| `src/utils/catGenerator.ts` | 新建 | 猫咪数据生成器 |
| `src/components/Map/RealMap.tsx` | 新建 | 真实地图组件 |
| `src/pages/index/index.tsx` | 修改 | 整合真实地图 |
| `src/constants.tsx` | 修改 | 添加默认位置坐标 |

---

## 详细实现

### 1. 默认位置设置

```typescript
// src/constants.tsx
export const DEFAULT_LOCATION = {
  latitude: 31.2079,  // 上海田子坊
  longitude: 121.4737,
  name: '上海田子坊'
};
```

### 2. 类型定义

```typescript
// src/types.ts
export interface GeoPosition {
  latitude: number;
  longitude: number;
}

export interface CatLocation {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}
```

### 3. 位置服务

```typescript
// src/services/location.ts

// 获取用户当前位置
export const getUserLocation = (): Promise<GeoPosition> => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: reject
    });
  });
};

// 返回默认位置
export const getDefaultLocation = (): GeoPosition => {
  return {
    latitude: 31.2079,
    longitude: 121.4737
  };
};

// 计算两点间距离（米）
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
```

### 4. 猫咪生成器

```typescript
// src/utils/catGenerator.ts

import { Cat } from '../types';
import { DEFAULT_LOCATION } from '../constants';

// 随机坐标生成（基于中心点，半径范围内）
const generateRandomCoords = (
  center: { latitude: number; longitude: number },
  radiusMeters: number
): { latitude: number; longitude: number } => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = radiusMeters * Math.sqrt(Math.random());
  
  const latOffset = (distance / 111320) * Math.cos(angle);
  const lngOffset = (distance / (111320 * Math.cos(center.latitude))) * Math.sin(angle);
  
  return {
    latitude: center.latitude + latOffset,
    longitude: center.longitude + lngOffset
  };
};

// 计算两点间距离
const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// 猫咪数据生成器
export const generateNearbyCats = (
  userLocation: { latitude: number; longitude: number },
  count: number = 10
): Cat[] => {
  const names = ['Boss Orange', 'Mochi', 'Shadow', 'Luna', 'Coco', 'Neko', 'Mimi', 'Ginger', 'Whiskers', 'Bella'];
  const statuses: Cat['status'][] = ['active', 'sleeping', 'hidden'];
  const avatars = [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&q=80',
    'https://images.unsplash.com/photo-1495360019602-e001922271aa?w=200&q=80',
  ];
  
  const cats: Cat[] = [];
  
  for (let i = 0; i < count; i++) {
    const coords = generateRandomCoords(userLocation, 2000); // 2km 范围内
    const distance = calcDistance(
      userLocation.latitude, userLocation.longitude,
      coords.latitude, coords.longitude
    );
    
    cats.push({
      id: String(i + 1),
      name: names[i % names.length],
      avatar: avatars[i % avatars.length],
      coverImage: avatars[i % avatars.length],
      latitude: coords.latitude,
      longitude: coords.longitude,
      status: statuses[i % statuses.length],
      badges: [`Badge ${i + 1}`],
      distance: distance,
      friendliness: Math.floor(Math.random() * 5) + 1,
      description: `A friendly cat found nearby.`,
      lastSeen: 'Just now'
    });
  }
  
  return cats;
};
```

### 5. 真实地图组件

```typescript
// src/components/Map/RealMap.tsx

import React, { useState, useEffect } from 'react';
import { View, mapProps } from '@tarojs/components';
import { Cat } from '../../types';
import { getUserLocation, getDefaultLocation } from '../../services/location';
import { generateNearbyCats } from '../../utils/catGenerator';
import { CatBottomSheet } from '../Sheet/CatBottomSheet';
import { RefreshCw, MapPin } from 'lucide-react';
import Taro from '@tarojs/taro';

interface RealMapProps {
  onCatSelect?: (cat: Cat) => void;
}

export const RealMap: React.FC<RealMapProps> = ({ onCatSelect }) => {
  const [center, setCenter] = useState({ latitude: 31.2079, longitude: 121.4737 });
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);

  // 生成 markers
  const markers = cats.map((cat, index) => ({
    id: Number(cat.id),
    latitude: cat.lat,
    longitude: cat.lng,
    iconPath: cat.avatar,
    width: 40,
    height: 40,
    callout: {
      content: cat.name,
      display: 'ALWAYS',
      padding: 8,
      borderRadius: 4,
      color: '#5D4037',
      bgColor: '#FDFBF7'
    }
  }));

  // 用户位置 marker
  const userMarker = {
    id: 0,
    latitude: center.latitude,
    longitude: center.longitude,
    iconPath: '', // 使用默认蓝色圆点
    width: 20,
    height: 20
  };

  // 初始化位置和猫咪数据
  useEffect(() => {
    const initMap = async () => {
      try {
        const location = await getUserLocation();
        setCenter(location);
        setCats(generateNearbyCats(location, 8));
      } catch (error) {
        // 使用默认位置
        const defaultLoc = getDefaultLocation();
        setCenter(defaultLoc);
        setCats(generateNearbyCats(defaultLoc, 8));
      } finally {
        setLoading(false);
      }
    };
    initMap();
  }, []);

  // 刷新猫咪数据
  const handleRefresh = () => {
    setLoading(true);
    setCats(generateNearbyCats(center, 8));
    setTimeout(() => setLoading(false), 500);
  };

  // 回到用户位置
  const handleLocateUser = () => {
    getUserLocation()
      .then(location => setCenter(location))
      .catch(() => {
        Taro.showToast({ title: '无法获取位置', icon: 'none' });
      });
  };

  // 点击 marker
  const handleMarkerTap = (e: any) => {
    const catId = e.detail.markerId;
    if (catId === 0) return; // 用户位置 marker
    const cat = cats.find(c => Number(c.id) === catId);
    if (cat) {
      setSelectedCat(cat);
      onCatSelect?.(cat);
    }
  };

  return (
    <View className="relative w-full h-full">
      {/* 真实地图 */}
      <map
        className="absolute inset-0 w-full h-full"
        latitude={center.latitude}
        longitude={center.longitude}
        scale={16}
        markers={[userMarker, ...markers]}
        showLocation
        onMarkerTap={handleMarkerTap}
        enableOverlooking={false}
        showScale={false}
      />

      {/* 绘本风格覆盖层 */}
      <View className="absolute inset-0 bg-[#FDFBF7]/50 pointer-events-none" />

      {/* 刷新按钮 */}
      <View
        className="absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
        onClick={handleRefresh}
      >
        <RefreshCw size={20} className={`text-[#5D4037] ${loading ? 'animate-spin' : ''}`} />
      </View>

      {/* 定位按钮 */}
      <View
        className="absolute bottom-24 right-16 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10"
        onClick={handleLocateUser}
      >
        <MapPin size={20} className="text-[#5D4037]" />
      </View>

      {/* 详情卡片 */}
      {selectedCat && (
        <CatBottomSheet
          cat={selectedCat}
          onClose={() => setSelectedCat(null)}
          onViewProfile={(cat) => {
            // 导航到猫咪位置
            Taro.openLocation({
              latitude: cat.lat,
              longitude: cat.lng,
              name: cat.name,
              scale: 18
            });
          }}
        />
      )}
    </View>
  );
};
```

### 6. 主页面整合

```typescript
// src/pages/index/index.tsx (部分修改)

import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { RealMap } from '../../components/Map/RealMap';
import { BottomNav } from '../../components/Navigation/BottomNav';
import { CatBottomSheet } from '../../components/Sheet/CatBottomSheet';
import { Cat, ViewState } from '../../types';

export default function Index() {
  const [view, setView] = useState<ViewState>('map');
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View className="flex flex-col items-center justify-center h-screen bg-[#FDFBF7] text-[#5D4037]">
        <View className="relative">
          <View className="w-16 h-16 border-4 border-[#FF9F43] border-t-transparent rounded-full animate-spin" />
          <View className="absolute inset-0 flex items-center justify-center font-bold text-xl">🐱</View>
        </View>
        <Text className="mt-4 font-rounded font-bold animate-pulse">Tracking paws...</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col h-screen bg-[#FDFBF7]">
      {view === 'map' && (
        <View className="flex-1 relative">
          <RealMap onCatSelect={setSelectedCat} />
          {/* 底部搜索栏、猫咪卡片等保持不变 */}
        </View>
      )}

      {view === 'journal' && (
        <Journal />
      )}

      <BottomNav
        currentView={view}
        onChangeView={setView}
        onOpenDiscovery={() => {}}
      />

      {selectedCat && (
        <CatBottomSheet
          cat={selectedCat}
          onClose={() => setSelectedCat(null)}
          onViewProfile={(cat) => {
            Taro.openLocation({
              latitude: cat.lat,
              longitude: cat.lng,
              name: cat.name,
              scale: 18
            });
          }}
        />
      )}
    </View>
  );
}
```

---

## 关键算法

### 随机坐标生成

```typescript
// 以用户位置为圆心，在指定半径范围内随机生成坐标
const generateRandomCoords = (
  center: { latitude: number; longitude: number },
  radiusMeters: number
) => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = radiusMeters * Math.sqrt(Math.random());
  
  // 经纬度偏移量计算
  const latOffset = (distance / 111320) * Math.cos(angle);
  const lngOffset = (distance / (111320 * Math.cos(center.latitude))) * Math.sin(angle);
  
  return {
    latitude: center.latitude + latOffset,
    longitude: center.longitude + lngOffset
  };
};
```

### 距离计算（ Haversine 公式）

```typescript
const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
```

---

## 交互流程

```
1. 用户打开应用
   ↓
2. 弹窗请求位置授权
   ├─ 同意 → 获取真实位置 → 生成附近猫咪（8只）
   └─ 拒绝 → 使用上海默认位置 → 生成附近猫咪（8只）
   ↓
3. 显示真实地图 + 50%透明米色滤镜 + 猫咪标记
   ↓
4. 用户操作
   ├─ 点击猫咪 → 显示 CatBottomSheet 详情
   ├─ 点击"带我去那里" → 调用微信导航
   ├─ 点击右下角刷新 → 重新生成猫咪位置
   └─ 点击定位图标 → 回到用户位置
```

---

## 预估工作量

| 模块 | 工作量 | 复杂度 |
|------|--------|--------|
| 位置服务 (`location.ts`) | 1 小时 | 低 |
| 猫咪生成器 (`catGenerator.ts`) | 1 小时 | 低 |
| 真实地图组件 (`RealMap.tsx`) | 2-3 小时 | 中 |
| 主页面整合 (`index.tsx`) | 1 小时 | 低 |
| 测试与调试 | 2 小时 | 中 |

**总计：约 7-9 小时**

---

## 注意事项

1. **微信小程序地图组件限制**
   - `markers` 的 `iconPath` 需要使用本地路径或临时路径
   - 网络图片需要先下载到本地

2. **位置权限配置**
   - 在 `app.json` 中添加 `permission` 配置
   - 微信公众平台后台开启 `scope.userLocation`

3. **iOS/Android 差异**
   - `wx.getLocation` 在不同系统表现可能不同
   - 需要在真机上测试

4. **覆盖层设计**
   - 50% 透明度的米色滤镜
   - `pointer-events-none` 确保地图可交互

---

## 附录：微信地图组件常用属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `latitude` | number | 中心纬度 |
| `longitude` | number | 中心经度 |
| `scale` | number | 缩放级别（3-20） |
| `markers` | Array | 标记点 |
| `showLocation` | boolean | 显示用户位置 |
| `enableOverlooking` | boolean | 开启俯视 |
| `showScale` | boolean | 显示比例尺 |
| `onMarkerTap` | Event | 点击标记点事件 |

---

*文档生成时间：2026-01-15*
*版本：v1.0*
