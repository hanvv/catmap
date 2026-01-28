/**
 * 猫咪数据生成器
 * 基于用户位置生成随机分布的猫咪数据
 */

import { Cat } from '../types';
import { calculateDistance } from '../services/location';

// 猫咪名字池
const CAT_NAMES = [
    'Boss Orange', 'Mochi', 'Shadow', 'Luna', 'Coco',
    'Neko', 'Mimi', 'Ginger', 'Whiskers', 'Bella',
    '小橘', '豆豆', '黑炭', '雪球', '花花'
];

// 猫咪状态池
const CAT_STATUSES: Cat['status'][] = ['active', 'sleeping', 'hidden'];

// 猫咪头像池（Unsplash 猫咪图片）
const CAT_AVATARS = [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&q=80',
    'https://images.unsplash.com/photo-1495360019602-e001922271aa?w=200&q=80',
    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=200&q=80',
    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&q=80'
];

// 猫咪徽章池
const CAT_BADGES = [
    ['💊 药店守护者', '👑 街头之王'],
    ['☕ 咖啡店经理', '😴 专业午睡'],
    ['👻 忍者', '🐟 鱼贩克星'],
    ['🌙 夜行者', '🐭 捕鼠达人'],
    ['☀️ 晒太阳专家', '🎀 颜值担当']
];

// 猫咪描述池
const CAT_DESCRIPTIONS = [
    '街区里无可争议的统治者，喜欢干贝但讨厌摩托车声。',
    '喜欢睡在咖啡机上因为暖和，有零食的话非常友好。',
    '很难抓到，通常躲在旧书店的箱子后面。',
    '夜间活动的神秘猫咪，白天难得一见。',
    '最喜欢在阳光下打盹的小可爱。'
];

/**
 * 随机坐标生成（基于中心点，半径范围内）
 * @param center 中心点坐标
 * @param radiusMeters 半径（米）
 * @returns 随机生成的坐标
 */
const generateRandomCoords = (
    center: { latitude: number; longitude: number },
    radiusMeters: number
): { latitude: number; longitude: number } => {
    // 随机角度和距离
    const angle = Math.random() * 2 * Math.PI;
    const distance = radiusMeters * Math.sqrt(Math.random()); // sqrt 确保均匀分布

    // 经纬度偏移量计算
    // 纬度：1度 ≈ 111320 米
    // 经度：1度 ≈ 111320 * cos(纬度) 米
    const latOffset = (distance / 111320) * Math.cos(angle);
    const lngOffset = (distance / (111320 * Math.cos(center.latitude * Math.PI / 180))) * Math.sin(angle);

    return {
        latitude: center.latitude + latOffset,
        longitude: center.longitude + lngOffset
    };
};

/**
 * 生成附近猫咪数据
 * @param userLocation 用户位置
 * @param count 生成数量，默认 8 只
 * @returns Cat[] 猫咪数据数组
 */
export const generateNearbyCats = (
    userLocation: { latitude: number; longitude: number },
    count: number = 8
): Cat[] => {
    const cats: Cat[] = [];

    for (let i = 0; i < count; i++) {
        // 在 2km 范围内随机生成坐标
        const coords = generateRandomCoords(userLocation, 2000);

        // 计算与用户的距离
        const distance = calculateDistance(
            userLocation.latitude, userLocation.longitude,
            coords.latitude, coords.longitude
        );

        cats.push({
            id: String(i + 1),
            name: CAT_NAMES[i % CAT_NAMES.length],
            avatar: CAT_AVATARS[i % CAT_AVATARS.length],
            coverImage: CAT_AVATARS[i % CAT_AVATARS.length],
            lat: coords.latitude,
            lng: coords.longitude,
            status: CAT_STATUSES[i % CAT_STATUSES.length],
            badges: CAT_BADGES[i % CAT_BADGES.length],
            distance: distance,
            friendliness: Math.floor(Math.random() * 5) + 1,
            description: CAT_DESCRIPTIONS[i % CAT_DESCRIPTIONS.length],
            lastSeen: getRandomLastSeen()
        });
    }

    // 按距离排序
    return cats.sort((a, b) => a.distance - b.distance);
};

/**
 * 生成随机的"最后发现"时间
 */
const getRandomLastSeen = (): string => {
    const options = [
        '刚刚',
        '5分钟前',
        '10分钟前',
        '30分钟前',
        '1小时前',
        '2小时前',
        '昨天'
    ];
    return options[Math.floor(Math.random() * options.length)];
};
