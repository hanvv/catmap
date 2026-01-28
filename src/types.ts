export interface Cat {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  lat: number;
  lng: number;
  status: 'active' | 'sleeping' | 'hidden';
  badges: string[];
  distance: number; // in meters
  friendliness: number; // 1-5
  description: string;
  lastSeen: string;
}

export interface UserStats {
  stamps: number;
  photos: number;
  level: string;
  badges: string[];
}

export type ViewState = 'map' | 'journal' | 'profile' | 'discovery';

export interface TabItem {
  id: ViewState;
  icon: React.ReactNode;
  label: string;
}

// 地理位置相关类型
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
