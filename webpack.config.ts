import fs from 'fs'
import { jsonc } from 'jsonc'

import webpack, { HotModuleReplacementPlugin } from 'webpack'

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { LicenseWebpackPlugin } from 'license-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin'

const modeArg = process.argv.filter(str => str.startsWith('--mode')).shift()
const mode = modeArg !== undefined ? modeArg.split('=')[1].trim() : 'development'
const devMode = mode !== 'production'
// should use ts but it's damn slow
const TSConfig = fs.readFileSync('./tsconfig.json')
const { jsx, jsxFactory, experimentalDecorators } = jsonc.parse(TSConfig.toString()).compilerOptions

function notBoolean<T>(i: T): i is Exclude<T, boolean> {
    return typeof i !== 'boolean'
}

const rules: webpack.RuleSetRule[] = [
    {
        test: /\.tsx?$/,
        // use babel-loader because
        // 1) vue need it 2) it support browserslists 3) it's slightly faster
        // however it adds alot dependency, it's hardly to tell it's good or not
        loader: 'babel-loader',
        options: {
            cacheDirectory: __dirname + '/.cache',
            parserOpts: { strictMode: true },
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        useBuiltIns: 'usage',
                        corejs: { version: 3, proposals: true }
                    }
                ]
            ],
            plugins: [
                [
                    '@babel/plugin-transform-typescript',
                    {
                        isTSX: !!jsx,
                        jsxPragma: jsxFactory
                    }
                ],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                !!experimentalDecorators && ['@babel/plugin-proposal-decorators', { legacy: true }],
                !!jsx && ['@babel/plugin-transform-react-jsx', { pragma: jsxFactory }]
            ].filter(notBoolean)
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
            {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            },
            devMode || {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true
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

const config: webpack.Configuration = {
    entry: [__dirname + '/src/main.ts', __dirname + '/src/styles.scss'],
    // eval source map is faster when rebuild, but make complied code
    // totally unreadable
    // use inline-cheap-module-source-map instead if needed
    devtool: devMode ? 'cheap-module-eval-source-map' : 'nosources-source-map',
    output: {
        path: __dirname + '/dist',
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
            server._watch(__dirname + '/src/index.html')
        },
        historyApiFallback: true,
        clientLogLevel: 'warning',
        hot: true
    },
    mode: devMode ? 'development' : 'production',
    module: { rules },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
        }),
        // only in dev
        devMode &&
            new ForkTsCheckerWebpackPlugin({
                eslint: true
            }),
        devMode && new HotModuleReplacementPlugin(),
        // only in prod
        devMode || new CleanWebpackPlugin(),
        devMode ||
            new MiniCssExtractPlugin({
                chunkFilename: 'styles.[contenthash].css'
            }),
        // because why not
        devMode ||
            (new LicenseWebpackPlugin({
                perChunkOutput: false
            }) as any)
    ].filter(notBoolean)
}

export default config
