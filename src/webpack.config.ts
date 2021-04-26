import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { readFileSync } from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { parse } from 'jsonc-parser'
import { LicenseWebpackPlugin } from 'license-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { resolve } from 'path'
import webpack, { DefinePlugin, HotModuleReplacementPlugin } from 'webpack'

import { appPath } from './path'

const modeArg = process.argv.filter(str => str.startsWith('--mode')).shift()
const mode = modeArg !== undefined ? modeArg.split('=')[1].trim() : 'development'
export const devMode = mode !== 'production'
// should use ts but it's damn slow
const TSConfig = readFileSync(resolve(appPath, './tsconfig.json'))
const { baseUrl, experimentalDecorators } = parse(TSConfig.toString()).compilerOptions

function notBoolean<T>(i: T): i is Exclude<T, boolean> {
    return typeof i !== 'boolean'
}

const swcLoader: webpack.RuleSetUseItem = {
    loader: 'swc-loader',
    options: {
        jsc: {
            parser: {
                syntax: 'typescript',
                tsx: true,
                dynamicImport: true
            },
            loose: true,
            transform: {
                react: {
                    runtime: 'automatic',
                    refresh: devMode
                }
            }
        }
    }
}

const babelLoader: webpack.RuleSetUseItem = {
    loader: 'babel-loader',
    options: {
        cacheDirectory: resolve(appPath, './.cache'),
        presets: [
            [
                '@babel/preset-env',
                {
                    loose: true,
                    useBuiltIns: 'usage',
                    corejs: { version: '3', proposals: true },
                    shippedProposals: true
                }
            ],
            [
                '@babel/preset-typescript',
                {
                    isTSX: true,
                    allExtensions: true,
                    onlyRemoveTypeImports: true
                }
            ],
            [
                '@babel/preset-react',
                {
                    runtime: 'automatic',
                    development: devMode
                }
            ]
        ],
        plugins: [
            !!experimentalDecorators && ['@babel/plugin-proposal-decorators', { legacy: true }],
            devMode && 'react-refresh/babel'
        ].filter(notBoolean)
    }
}

const rules: webpack.RuleSetRule[] = [
    {
        test: /\.(j|t)sx?$/,
        use: devMode ? swcLoader : babelLoader,
        include: /src/
    },
    {
        test: /\.html$/,
        loader: 'html-loader'
    },
    {
        test: /\.s?css$/,
        use: [
            devMode
                ? {
                      loader: 'style-loader',
                      options: {
                          modules: {
                              namedExport: true
                          }
                      }
                  }
                : {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                          modules: {
                              namedExport: true
                          }
                      }
                  },
            {
                loader: 'css-loader',
                options: {
                    modules: {
                        auto: true,
                        namedExport: true,
                        localIdentName: devMode ? '[name]__[local]' : '[sha256:hash:base64:6]'
                    }
                }
            },
            devMode || {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: ['postcss-preset-env', 'cssnano']
                    }
                }
            },
            'sass-loader'
        ].filter(notBoolean)
    },
    {
        test: /\.less$/,
        use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            devMode || {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: ['postcss-preset-env', 'cssnano']
                    }
                }
            },
            { loader: 'less-loader', options: { lessOptions: { javascriptEnabled: true } } }
        ].filter(notBoolean)
    },
    {
        test: /\.(png|jpg|gif|svg|webp|avif)$/,
        type: 'asset/resource',
        parser: {
            dataUrlCondition: {
                maxSize: 1024
            }
        }
    }
]

const modules = ['node_modules']
if (baseUrl) modules.push(resolve(appPath, baseUrl))

const config: webpack.Configuration = {
    entry: resolve(appPath, './src/index'),
    // eval source map is faster when rebuild, but make complied code
    // totally unreadable
    // use inline-cheap-module-source-map instead if needed
    devtool: devMode ? 'eval-cheap-module-source-map' : 'nosources-source-map',
    output: {
        path: resolve(appPath, './dist'),
        filename: devMode ? '[name].js' : '[name].[contenthash].js',
        assetModuleFilename: devMode ? '[name].[ext]' : 'asset/[name].[ext]?[hash]'
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            minChunks: 2,
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendors',
                    chunks: 'all',
                    minChunks: 1
                }
            }
        }
    },
    devServer: {
        historyApiFallback: true,
        liveReload: false
    },
    mode: devMode ? 'development' : 'production',
    module: { rules },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs'],
        alias: {
            '@': resolve(appPath, 'src/')
        },
        modules
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'asset/index.html',
            inject: 'body'
        }),
        new DefinePlugin({
            process: {
                env: {
                    DEV: devMode
                }
            }
        }),
        // only in dev
        devMode &&
            new ForkTsCheckerWebpackPlugin({
                eslint: {
                    files: resolve(appPath, './src/**/*.{ts,tsx,js,jsx}')
                }
            }),
        devMode && new HotModuleReplacementPlugin(),
        devMode && new ReactRefreshWebpackPlugin({ esModule: true }),
        // only in prod
        // devMode || new MultiBuildPlugin(),
        devMode || new CleanWebpackPlugin(),
        devMode ||
            new MiniCssExtractPlugin({
                filename: 'styles.[contenthash].css'
            }),
        devMode ||
            (new LicenseWebpackPlugin({
                perChunkOutput: false
            }) as any)
    ].filter(notBoolean)
}

export default config
