import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { RealMap } from '../../components/Map/RealMap';
import { BottomNav } from '../../components/Navigation/BottomNav';
import { CatBottomSheet } from '../../components/Sheet/CatBottomSheet';
import { Journal } from '../../pages/Journal';
import { Discovery } from '../../pages/Discovery';
import { USER_STATS } from '../../constants';
import { Cat, ViewState } from '../../types';

export default function Index() {
    const [view, setView] = useState<ViewState>('map');
    const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
    const [showDiscovery, setShowDiscovery] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    // 正在导航的猫咪
    const [navigatingCat, setNavigatingCat] = useState<Cat | null>(null);
    // 顶部安全区域高度
    const [topOffset, setTopOffset] = useState(50);

    useEffect(() => {
        // 获取微信胶囊按钮位置
        try {
            const menuButton = Taro.getMenuButtonBoundingClientRect();
            setTopOffset(menuButton.top);
        } catch (e) {
            setTopOffset(50);
        }

        // 模拟加载
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    /**
     * 导航到猫咪位置 - 在地图上显示路线
     */
    const handleNavigateToCat = (cat: Cat) => {
        setNavigatingCat(cat);
        setSelectedCat(null); // 关闭详情卡片
        Taro.showToast({
            title: `正在规划前往 ${cat.name} 的路线`,
            icon: 'none',
            duration: 1500
        });
    };

    /**
     * 取消导航
     */
    const handleCancelNavigation = () => {
        setNavigatingCat(null);
    };

    /**
     * 处理搜索
     */
    const handleSearch = () => {
        if (searchValue.trim()) {
            Taro.showToast({
                title: `搜索: ${searchValue}`,
                icon: 'none',
                duration: 1500
            });
        }
    };

    if (loading) {
        return (
            <View className="flex flex-col items-center justify-center h-screen bg-[#FDFBF7] text-[#5D4037]">
                <View className="relative">
                    <View className="w-16 h-16 border-4 border-[#FF9F43] border-t-transparent rounded-full animate-spin" />
                    <View className="absolute inset-0 flex items-center justify-center font-bold text-xl">🐱</View>
                </View>
                <Text className="mt-4 font-bold">Tracking paws...</Text>
            </View>
        );
    }

    return (
        <View className="flex flex-col h-screen bg-[#FDFBF7]">
            {/* 地图视图 */}
            {view === 'map' && (
                <View className="relative flex-1">
                    {/* 真实地图 */}
                    <View className="absolute inset-0 z-0">
                        <RealMap
                            onCatSelect={setSelectedCat}
                            navigateToCat={navigatingCat}
                        />
                    </View>

                    {/* 浮动搜索栏 */}
                    <View
                        className="absolute z-20"
                        style={{
                            top: `${topOffset}px`,
                            left: '16px',
                            right: '100px'
                        }}
                    >
                        <View className="flex items-center gap-2">
                            {/* 用户头像 */}
                            <View
                                className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-white"
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                                onClick={() => setView('journal')}
                            >
                                <Image
                                    src="https://picsum.photos/100/100"
                                    className="w-full h-full"
                                    mode="aspectFill"
                                />
                            </View>

                            {/* 搜索框 - 可交互 */}
                            <View
                                className="flex-1 h-9 bg-white rounded-full flex items-center px-3"
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                            >
                                <Text className="mr-1">🔍</Text>
                                <Input
                                    type="text"
                                    placeholder="Search: Orange Boss..."
                                    placeholderClass="text-gray-400"
                                    className="flex-1 text-sm text-[#5D4037]"
                                    value={searchValue}
                                    onInput={(e) => setSearchValue(e.detail.value)}
                                    onConfirm={handleSearch}
                                />
                            </View>

                            {/* 筛选按钮 */}
                            <View
                                className="shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center"
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                                onClick={() => Taro.showToast({ title: '筛选功能开发中', icon: 'none' })}
                            >
                                <Text className="text-gray-500">⚙️</Text>
                            </View>
                        </View>
                    </View>

                    {/* 猫咪详情卡片 */}
                    <CatBottomSheet
                        cat={selectedCat}
                        onClose={() => setSelectedCat(null)}
                        onViewProfile={handleNavigateToCat}
                    />
                </View>
            )}

            {/* 日记视图 */}
            {view === 'journal' && (
                <View className="absolute inset-0 z-0">
                    <Journal stats={USER_STATS} />
                </View>
            )}

            {/* 底部导航栏 */}
            <BottomNav
                currentView={view}
                onChangeView={(v) => {
                    setView(v);
                    setSelectedCat(null);
                }}
                onOpenDiscovery={() => setShowDiscovery(true)}
            />

            {/* 发现页面弹窗 */}
            {showDiscovery && (
                <Discovery onClose={() => setShowDiscovery(false)} />
            )}
        </View>
    );
}
