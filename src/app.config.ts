export default defineAppConfig({
    pages: [
        'pages/index/index'
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'Cat Map',
        navigationBarTextStyle: 'black',
        navigationStyle: 'custom'
    },
    // 地理位置权限配置
    permission: {
        'scope.userLocation': {
            desc: '您的位置信息将用于发现附近的猫咪'
        }
    },
    // 需要使用的地图相关权限（只使用有效值）
    requiredPrivateInfos: [
        'getLocation',
        'chooseLocation'
    ]
})
