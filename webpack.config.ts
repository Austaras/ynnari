import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { readFileSync } from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { parse } from 'jsonc-parser'
import { LicenseWebpackPlugin } from 'license-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { resolve } from 'path'
import webpack, { HotModuleReplacementPlugin } from 'webpack'

const modeArg = process.argv.filter(str => str.startsWith('--mode')).shift()
const mode = modeArg !== undefined ? modeArg.split('=')[1].trim() : 'development'
const devMode = mode !== 'production'
// should use ts but it's damn slow
const TSConfig = readFileSync('./tsconfig.json')
const { baseUrl, jsx, jsxFactory, experimentalDecorators } = parse(TSConfig.toString()).compilerOptions

function notBoolean<T>(i: T): i is Exclude<T, boolean> {
    return typeof i !== 'boolean'
}

const rules: webpack.RuleSetRule[] = [
    {
        test: /\.tsx?$/,
        use: {
            loader: 'babel-loader',
            options: {
                cacheDirectory: resolve(__dirname, './.cache'),
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
                            isTSX: !!jsx,
                            allExtensions: !!jsx,
                            jsxPragma: jsxFactory,
                            onlyRemoveTypeImports: true
                        }
                    ],
                    [
                        '@babel/preset-react',
                        {
                            runtime: 'automatic',
                            development: devMode,
                            importSource: 'custom-jsx-library'
                        }
                    ]
                ].filter(notBoolean),
                plugins: [
                    !!experimentalDecorators && ['@babel/plugin-proposal-decorators', { legacy: true }]
                ].filter(notBoolean)
            }
        },
        include: /src/
    },
    {
        test: /\.html$/,
        loader: 'html-loader'
    },
    {
        test: /\.s?css$/,
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
            'sass-loader'
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
if (baseUrl) modules.push(resolve(__dirname, baseUrl))

const config: webpack.Configuration = {
    entry: resolve(__dirname, './src/main.ts'),
    // eval source map is faster when rebuild, but make complied code
    // totally unreadable
    // use inline-cheap-module-source-map instead if needed
    devtool: devMode ? 'eval-cheap-module-source-map' : 'nosources-source-map',
    output: {
        path: resolve(__dirname, './dist'),
        filename: devMode ? '[name].js' : '[name].[contenthash].js',
        assetModuleFilename: devMode ? '[name].[ext]' : 'assets/[name].[ext]?[hash]'
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
        modules
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/assets/index.html',
            inject: 'body'
        }),
        // only in dev
        devMode &&
            new ForkTsCheckerWebpackPlugin({
                eslint: {
                    files: './src/**/*.{ts,tsx,js,jsx}'
                }
            }),
        devMode && new HotModuleReplacementPlugin(),
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
