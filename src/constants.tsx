import { Cat, UserStats } from './types';

export const MOCK_CATS: Cat[] = [
  {
    id: '1',
    name: 'Boss Orange',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 40,
    lng: 50,
    status: 'active',
    badges: ['💊 Pharmacy Security', '👑 King of the Street'],
    distance: 120,
    friendliness: 4,
    description: "The undisputed ruler of the dried seafood street. Loves dried scallops but hates loud motorcycles.",
    lastSeen: '10 mins ago'
  },
  {
    id: '2',
    name: 'Mochi',
    avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 60,
    lng: 30,
    status: 'sleeping',
    badges: ['☕ Cafe Manager', '😴 Professional Napper'],
    distance: 350,
    friendliness: 5,
    description: "Sleeps on the espresso machine because it's warm. Very friendly if you have treats.",
    lastSeen: '2 hours ago'
  },
  {
    id: '3',
    name: 'Shadow',
    avatar: 'https://images.unsplash.com/photo-1495360019602-e001922271aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1495360019602-e001922271aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    lat: 20,
    lng: 70,
    status: 'hidden',
    badges: ['👻 Ninja', '🐟 Fish Thief'],
    distance: 800,
    friendliness: 2,
    description: "Hard to catch. Usually hiding behind the old bookstore boxes.",
    lastSeen: 'Yesterday'
  }
];

export const USER_STATS: UserStats = {
  stamps: 12,
  photos: 45,
  level: 'Cat Whisperer',
  badges: ['Tsim Sha Tsui Patroller', 'Canned Food Tycoon']
};

// Colors
export const COLORS = {
  primary: '#FF9F43', // Warm Orange
  text: '#5D4037',    // Cocoa Brown
  bg: '#FDFBF7',      // Warm Paper
  success: '#2ED573',
  inactive: '#A4B0BE'
};

// 默认位置（上海田子坊）
export const DEFAULT_LOCATION = {
  latitude: 31.2079,
  longitude: 121.4737,
  name: '上海田子坊'
};
