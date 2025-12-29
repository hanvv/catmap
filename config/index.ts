import { defineConfig, type UserConfigExport } from '@tarojs/cli'
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-helper
export default defineConfig(async (merge, { command, mode }) => {
    const baseConfig: UserConfigExport = {
        projectName: 'catmap',
        date: '2025-12-29',
        designWidth: 750,
        deviceRatio: {
            640: 2.34 / 2,
            750: 1,
            375: 2,
            828: 1.81 / 2
        },
        sourceRoot: 'src',
        outputRoot: 'dist',
        plugins: [],
        defineConstants: {
        },
        copy: {
            patterns: [
            ],
            options: {
            }
        },
        framework: 'react',
        compiler: 'webpack5',
        cache: {
            enable: false // Webpack5 cache can cause issues in some environments
        },
        mini: {
            webpackChain(chain) {
                chain.merge({
                    plugin: {
                        install: {
                            plugin: UnifiedWebpackPluginV5,
                            args: [{
                                appType: 'taro'
                            }]
                        }
                    }
                })
            },
            postcss: {
                pxtransform: {
                    enable: true,
                    config: {

                    }
                },
                url: {
                    enable: true,
                    config: {
                        limit: 1024 // 1kb
                    }
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]'
                    }
                }
            }
        },
        h5: {
            publicPath: '/',
            staticDirectory: 'static',
            output: {
                filename: 'js/[name].[hash:8].js',
                chunkFilename: 'js/[name].[chunkhash:8].js'
            },
            miniCssExtractPluginOption: {
                ignoreOrder: true,
                filename: 'css/[name].[hash].css',
                chunkFilename: 'css/[name].[chunkhash].css'
            },
            postcss: {
                autoprefixer: {
                    enable: true,
                    config: {}
                },
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                    config: {
                        namingPattern: 'module', // 转换模式，取值为 global/module
                        generateScopedName: '[name]__[local]___[hash:base64:5]'
                    }
                }
            }
        },
        rn: {
            appName: 'catmap',
            postcss: {
                cssModules: {
                    enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
                }
            }
        }
    }
    if (process.env.NODE_ENV === 'development') {
        // development specific config
        return merge({}, baseConfig, devConfig)
    }
    return merge({}, baseConfig, prodConfig)
})
