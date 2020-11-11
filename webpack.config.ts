import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { readFileSync } from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { parse } from 'jsonc-parser'
// import { LicenseWebpackPlugin } from 'license-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { resolve } from 'path'
// import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin'
import webpack, { HotModuleReplacementPlugin } from 'webpack'
import { BabelMultiTargetPlugin } from 'webpack-babel-multi-target-plugin'

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
        // use babel-loader because
        // 1) vue need it 2) it support browserslists 3) it's slightly faster
        // however it adds alot dependency, it's hardly to tell it's good or not
        use: BabelMultiTargetPlugin.loader(),
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
        test: /\.(png|jpg|gif|svg|webp)$/,
        loader: 'url-loader',
        options: {
            name: devMode ? '[name].[ext]' : 'assets/[name].[ext]?[hash]',
            limit: 1025
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
        filename: devMode ? '[name].js' : '[name].[contenthash].js'
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
        // watch index.html changes
        before(_, server: any) {
            server._watch(__dirname + './src/index.html')
        },
        historyApiFallback: true,
        clientLogLevel: 'warning',
        hot: true
    },
    mode: devMode ? 'development' : 'production',
    module: { rules },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            inject: 'body'
        }),
        new BabelMultiTargetPlugin({
            babel: {
                cacheDirectory: resolve(__dirname, './.cache'),
                presets: [
                    [
                        '@babel/preset-typescript',
                        {
                            isTSX: !!jsx,
                            allExtensions: !!jsx,
                            jsxPragma: jsxFactory
                        }
                    ]
                ] as any,
                presetOptions: {
                    corejs: { version: 3, proposals: true }
                },
                plugins: [
                    ['@babel/plugin-proposal-class-properties', { loose: true }],
                    !!experimentalDecorators && ['@babel/plugin-proposal-decorators', { legacy: true }],
                    !!jsx && ['@babel/plugin-transform-react-jsx', { pragma: jsxFactory }]
                ].filter(notBoolean) as any
            }
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
            (new MiniCssExtractPlugin({
                filename: 'styles.[contenthash].css'
            }) as any)
        // devMode ||
        //     (new LicenseWebpackPlugin({
        //         perChunkOutput: false
        //     }) as any)
    ].filter(notBoolean)
}

export default config
