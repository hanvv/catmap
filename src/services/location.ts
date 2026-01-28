/**
 * 位置服务模块
 * 提供用户位置获取、默认位置和距离计算功能
 */

import Taro from '@tarojs/taro';
import { GeoPosition } from '../types';
import { DEFAULT_LOCATION } from '../constants';

/**
 * 获取用户当前位置
 * 调用微信 getLocation API
 * @returns Promise<GeoPosition> 用户位置坐标
 */
export const getUserLocation = (): Promise<GeoPosition> => {
    return new Promise((resolve, reject) => {
        Taro.getLocation({
            type: 'gcj02', // 使用国测局坐标系（微信推荐）
            success: (res) => {
                resolve({
                    latitude: res.latitude,
                    longitude: res.longitude
                });
            },
            fail: (err) => {
                console.warn('获取位置失败:', err);
                reject(err);
            }
        });
    });
};

/**
 * 返回默认位置
 * 用于用户拒绝授权时的回退
 * @returns GeoPosition 默认位置坐标（上海田子坊）
 */
export const getDefaultLocation = (): GeoPosition => {
    return {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude
    };
};

/**
 * 计算两点间距离（使用 Haversine 公式）
 * @param lat1 点1纬度
 * @param lng1 点1经度
 * @param lat2 点2纬度
 * @param lng2 点2经度
 * @returns number 距离（米）
 */
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
    return Math.round(R * c);
};
