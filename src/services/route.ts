/**
 * 腾讯地图路线规划服务
 * 调用腾讯地图 WebService API 获取真实步行路线
 */

import Taro from '@tarojs/taro';
import { GeoPosition } from '../types';

// 腾讯地图 API Key
const TENCENT_MAP_KEY = 'J2EBZ-LSNKD-HWL4B-PI6E5-6XNY6-KXBS2';

/**
 * 路线点
 */
interface RoutePoint {
    latitude: number;
    longitude: number;
}

/**
 * 解压腾讯地图返回的 polyline 坐标
 * 腾讯地图 WebService API 返回格式：
 * - 第一个点：[纬度, 经度] 是绝对坐标（原始值）
 * - 后续点：[纬度差值, 经度差值] 单位是 0.00001 度
 */
const decompressPolyline = (polyline: number[]): RoutePoint[] => {
    const points: RoutePoint[] = [];

    if (!polyline || polyline.length < 2) {
        return points;
    }

    // 第一个点是绝对坐标（原始格式，不需要转换）
    let lat = polyline[0];
    let lng = polyline[1];

    points.push({
        latitude: lat,
        longitude: lng
    });

    // 后续点是相对于前一个点的差值（单位是 0.00001 度）
    for (let i = 2; i < polyline.length; i += 2) {
        const dLat = polyline[i] || 0;
        const dLng = polyline[i + 1] || 0;
        lat += dLat * 0.00001;
        lng += dLng * 0.00001;
        points.push({
            latitude: lat,
            longitude: lng
        });
    }

    return points;
};

/**
 * 获取步行路线
 * @param from 起点坐标
 * @param to 终点坐标
 * @returns 路线点数组
 */
export const getWalkingRoute = async (
    from: GeoPosition,
    to: GeoPosition
): Promise<RoutePoint[]> => {
    try {
        console.log('开始获取步行路线:', { from, to });

        // 调用腾讯地图步行路线规划 API
        const res = await Taro.request({
            url: 'https://apis.map.qq.com/ws/direction/v1/walking/',
            method: 'GET',
            data: {
                from: `${from.latitude},${from.longitude}`,
                to: `${to.latitude},${to.longitude}`,
                key: TENCENT_MAP_KEY
            }
        });

        console.log('腾讯地图 API 返回:', res.data);

        if (res.data.status === 0 && res.data.result?.routes?.[0]) {
            const route = res.data.result.routes[0];
            const polyline = route.polyline || [];

            console.log('原始 polyline 长度:', polyline.length);

            // 解压坐标
            const points = decompressPolyline(polyline);

            console.log('解析后路线点数量:', points.length);
            if (points.length > 0) {
                console.log('路线起点:', points[0]);
                console.log('路线终点:', points[points.length - 1]);
            }

            if (points.length > 0) {
                return points;
            }
        }

        // API 返回错误信息
        console.error('API 返回错误:', res.data.message || res.data.status);
        throw new Error(res.data.message || '路线规划失败');
    } catch (error) {
        console.error('获取步行路线失败:', error);

        // 降级为简单的直线路线
        return [
            { latitude: from.latitude, longitude: from.longitude },
            { latitude: to.latitude, longitude: to.longitude }
        ];
    }
};
