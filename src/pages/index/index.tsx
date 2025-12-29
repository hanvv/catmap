import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Input } from '@tarojs/components';
import { ArtisticMap } from '../../components/Map/ArtisticMap';
import { Marker } from '../../components/Map/Marker';
import { BottomNav } from '../../components/Navigation/BottomNav';
import { CatBottomSheet } from '../../components/Sheet/CatBottomSheet';
import { Journal } from '../../pages/Journal'; // Temporarily import, will need to be a page navigation
import { Discovery } from '../../pages/Discovery'; // Temporarily import
import { MOCK_CATS, USER_STATS } from '../../constants';
import { Cat, ViewState } from '../../types';
import { Search, Filter } from 'lucide-react';

export default function Index() {
    const [view, setView] = useState<ViewState>('map');
    const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
    const [showDiscovery, setShowDiscovery] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <View className="flex flex-col items-center justify-center h-screen bg-[#FDFBF7] text-[#5D4037]">
                <View className="relative">
                    <View className="w-16 h-16 border-4 border-[#FF9F43] border-t-transparent rounded-full animate-spin"></View>
                    <View className="absolute inset-0 flex items-center justify-center font-bold text-xl">🐱</View>
                </View>
                <Text className="mt-4 font-rounded font-bold animate-pulse">Tracking paws...</Text>
            </View>
        );
    }

    return (
        <View className="flex flex-col h-screen bg-[#FDFBF7]">
            {/* Dynamic Content based on View */}
            {view === 'map' && (
                <View className="relative flex-1">
                    {/* Map Layer */}
                    <View className="absolute inset-0 z-0">
                        <ArtisticMap />

                        {/* Markers */}
                        <View className="absolute inset-0 z-10">
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
                        </View>
                    </View>

                    {/* Floating Search Bar */}
                    <View className="absolute top-12 left-4 right-4 z-20 flex items-center gap-3">
                        <View
                            className="w-10 h-10 rounded-full bg-white shadow-soft-orange flex items-center justify-center overflow-hidden border-2 border-white"
                            onClick={() => setView('journal')}
                        >
                            <Image src="https://picsum.photos/200/200" className="w-full h-full object-cover" />
                        </View>

                        <View className="flex-1 h-12 bg-white rounded-full shadow-soft-orange flex items-center px-4 gap-2">
                            <Search size={18} className="text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search: Orange Boss..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-[#5D4037] placeholder-gray-400"
                            />
                        </View>

                        <View className="w-12 h-12 rounded-full bg-white shadow-soft-orange flex items-center justify-center text-[#5D4037]">
                            <Filter size={20} />
                        </View>
                    </View>

                    {/* Cat Sheet */}
                    <CatBottomSheet
                        cat={selectedCat}
                        onClose={() => setSelectedCat(null)}
                        onViewProfile={(cat) => console.log('View full profile', cat.name)}
                    />
                </View>
            )}

            {view === 'journal' && (
                <View className="absolute inset-0 z-0 animate-[fadeIn_0.3s_ease-out]">
                    <Journal stats={USER_STATS} />
                </View>
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

        </View>
    );
}
