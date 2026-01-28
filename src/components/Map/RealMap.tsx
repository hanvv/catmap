/**
 * 真实地图组件
 * 显示微信地图 + 猫咪标记 + 真实路线导航
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Map, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Cat, GeoPosition } from '../../types';
import { getUserLocation, getDefaultLocation } from '../../services/location';
import { generateNearbyCats } from '../../utils/catGenerator';
import { getWalkingRoute } from '../../services/route';

interface RealMapProps {
    onCatSelect?: (cat: Cat) => void;
    navigateToCat?: Cat | null;
}

export const RealMap: React.FC<RealMapProps> = ({ onCatSelect, navigateToCat }) => {
    const [center, setCenter] = useState<GeoPosition>({ latitude: 31.2079, longitude: 121.4737 });
    const [userLocation, setUserLocation] = useState<GeoPosition | null>(null);
    const [cats, setCats] = useState<Cat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
    const [routeLoading, setRouteLoading] = useState(false);
    const mapContext = useRef<Taro.MapContext | null>(null);

    /**
     * 生成地图标记点
     */
    const markers = cats
        .filter(cat => cat && cat.lat !== undefined && cat.lng !== undefined)
        .map((cat) => {
            const statusColors = {
                active: '#22C55E',
                sleeping: '#9CA3AF',
                hidden: '#FBBF24'
            };
            const borderColor = statusColors[cat.status] || '#FF9F43';
            const isNavigating = navigateToCat?.id === cat.id;

            return {
                id: Number(cat.id),
                latitude: cat.lat,
                longitude: cat.lng,
                iconPath: '',
                width: isNavigating ? 40 : 30,
                height: isNavigating ? 40 : 30,
                callout: {
                    content: isNavigating ? `🎯 ${cat.name}` : `😺 ${cat.name}`,
                    display: 'ALWAYS' as const,
                    padding: isNavigating ? 12 : 10,
                    borderRadius: 20,
                    color: '#5D4037',
                    bgColor: isNavigating ? '#FFF3E0' : '#FFFFFF',
                    fontSize: isNavigating ? 14 : 13,
                    borderWidth: isNavigating ? 4 : 3,
                    borderColor: isNavigating ? '#FF9F43' : borderColor,
                    textAlign: 'center' as const,
                    anchorX: 0,
                    anchorY: 0
                },
                label: {
                    content: '',
                    color: 'transparent',
                    fontSize: 1,
                    anchorX: 0,
                    anchorY: 0,
                    bgColor: 'transparent',
                    borderWidth: 0,
                    borderColor: 'transparent',
                    borderRadius: 0,
                    padding: 0,
                    textAlign: 'center' as const
                }
            };
        });

    /**
     * 路线 polyline 配置
     */
    const polyline = routePoints.length > 0 ? [{
        points: routePoints,
        color: '#FF9F43',
        width: 6,
        dottedLine: false,
        arrowLine: true,
        borderColor: '#FFFFFF',
        borderWidth: 2
    }] : [];

    useEffect(() => {
        const initMap = async () => {
            try {
                const location = await getUserLocation();
                setCenter(location);
                setUserLocation(location);
                setCats(generateNearbyCats(location, 8));
            } catch (error) {
                const defaultLoc = getDefaultLocation();
                setCenter(defaultLoc);
                setUserLocation(defaultLoc);
                setCats(generateNearbyCats(defaultLoc, 8));
            } finally {
                setLoading(false);
            }
        };
        initMap();

        // 获取地图上下文
        setTimeout(() => {
            mapContext.current = Taro.createMapContext('catmap');
        }, 500);
    }, []);

    /**
     * 当导航目标变化时，获取真实路线
     */
    useEffect(() => {
        if (navigateToCat && userLocation) {
            console.log('=== 开始规划路线 ===');
            console.log('用户位置:', userLocation);
            console.log('目标猫咪:', navigateToCat.name);
            console.log('目标坐标:', { lat: navigateToCat.lat, lng: navigateToCat.lng });

            fetchRealRoute(userLocation, {
                latitude: navigateToCat.lat,
                longitude: navigateToCat.lng
            });
        } else {
            setRoutePoints([]);
        }
    }, [navigateToCat, userLocation]);

    /**
     * 获取真实步行路线
     */
    const fetchRealRoute = async (from: GeoPosition, to: GeoPosition) => {
        setRouteLoading(true);
        try {
            // 调用腾讯地图 API 获取真实路线
            const points = await getWalkingRoute(from, to);
            console.log('设置路线点:', points.length);
            setRoutePoints(points);

            // 将地图中心移动到用户当前位置，这样可以看到路线起点
            if (points.length > 0) {
                setCenter({
                    latitude: from.latitude,
                    longitude: from.longitude
                });
            }
        } catch (error) {
            console.error('获取路线失败:', error);
            Taro.showToast({ title: '路线规划失败', icon: 'none' });
        } finally {
            setRouteLoading(false);
        }
    };

    /**
     * 打开微信内置导航
     */
    const openWechatNavigation = () => {
        if (navigateToCat) {
            Taro.openLocation({
                latitude: navigateToCat.lat,
                longitude: navigateToCat.lng,
                name: navigateToCat.name,
                address: navigateToCat.description || '猫咪位置',
                scale: 18
            });
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setCats(generateNearbyCats(center, 8));
        setRoutePoints([]);
        setTimeout(() => setRefreshing(false), 500);
        Taro.showToast({ title: '已刷新猫咪位置', icon: 'none', duration: 1500 });
    };

    const handleLocateUser = async () => {
        try {
            const location = await getUserLocation();
            setCenter(location);
            setUserLocation(location);
            Taro.showToast({ title: '已定位到您的位置', icon: 'none', duration: 1500 });
        } catch (error) {
            Taro.showToast({ title: '无法获取位置', icon: 'none', duration: 1500 });
        }
    };

    const handleMarkerTap = (e: any) => {
        const markerId = e.detail?.markerId || e.markerId;
        const cat = cats.find(c => Number(c.id) === markerId);
        if (cat) {
            onCatSelect?.(cat);
        }
    };

    const handleCalloutTap = (e: any) => {
        const markerId = e.detail?.markerId || e.markerId;
        const cat = cats.find(c => Number(c.id) === markerId);
        if (cat) {
            onCatSelect?.(cat);
        }
    };

    if (loading) {
        return (
            <View className="absolute inset-0 flex items-center justify-center bg-[#FDFBF7]">
                <View className="text-center">
                    <Text className="text-4xl">🗺️</Text>
                    <Text className="block mt-2 text-[#5D4037]">正在加载地图...</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="relative w-full h-full">
            {/* 微信地图 */}
            <Map
                id="catmap"
                className="absolute inset-0 w-full h-full"
                latitude={center.latitude}
                longitude={center.longitude}
                scale={navigateToCat ? 16 : 15}
                markers={markers}
                polyline={polyline}
                showLocation={true}
                onMarkerTap={handleMarkerTap}
                onCalloutTap={handleCalloutTap}
                onError={(e) => console.warn('地图加载错误:', e)}
                enableOverlooking={false}
                showScale={false}
            />

            {/* 导航信息条 */}
            {navigateToCat && (
                <View
                    className="absolute left-4 right-4 bg-white rounded-2xl p-3 z-10 flex items-center gap-3"
                    style={{ top: '110px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)' }}
                >
                    <Text className="text-2xl">{routeLoading ? '⏳' : '🚶'}</Text>
                    <View className="flex-1">
                        <Text className="text-[#5D4037] font-bold">
                            {routeLoading ? '正在规划路线...' : `正在前往 ${navigateToCat.name}`}
                        </Text>
                        <Text className="text-gray-500 text-sm">预计距离 {navigateToCat.distance}m</Text>
                    </View>
                    {/* 打开微信导航按钮 */}
                    <View
                        className="px-3 py-2 bg-[#FF9F43] rounded-xl"
                        onClick={openWechatNavigation}
                    >
                        <Text className="text-white text-sm font-bold">导航</Text>
                    </View>
                </View>
            )}

            {/* 定位按钮 */}
            <View
                className="absolute right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center z-10"
                style={{ bottom: '130px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)' }}
                onClick={handleLocateUser}
            >
                <Text className="text-xl">📍</Text>
            </View>

            {/* 刷新按钮 */}
            <View
                className="absolute right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center z-10"
                style={{ bottom: '195px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)' }}
                onClick={handleRefresh}
            >
                <Text className={`text-xl ${refreshing ? 'animate-spin' : ''}`}>🔄</Text>
            </View>
        </View>
    );
};
