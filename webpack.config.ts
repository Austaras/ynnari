import webpack from 'webpack'

import CleanWebpackPlugin from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { LicenseWebpackPlugin } from 'license-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin'

const modeArg: string | undefined = process.argv.filter(str => str.startsWith('--mode'))[0]
const mode = modeArg !== undefined ? modeArg.split('=')[1].trim() : 'development'
const devMode = mode !== 'production'

// const pragma = 'h'

function notBoolean(i: unknown) {
    return typeof i !== 'boolean'
}

const rules: webpack.RuleSetRule[] = [
    {
        test: /\.tsx?$/,
        // use babel-loader because
        // 1) vue need it 2) it support browserslists 3) it's slightly faster
        // however it adds alot depend, it's hardly to tell it's good or not
        loader: 'babel-loader',
        options: {
            cacheDirectory: __dirname + '/.cache',
            parserOpts: { strictMode: true },
            presets: [['@babel/preset-env', { modules: false }]],
            plugins: [
                '@babel/plugin-transform-typescript',
                // [
                //     '@babel/plugin-transform-typescript',
                //     {
                //         isTSX: true,
                //         jsxPragma: pragma
                //     }
                // ],
                [
                    '@babel/plugin-proposal-object-rest-spread',
                    {
                        loose: true,
                        useBuiltIns: true
                    }
                ],
                ['@babel/plugin-proposal-class-properties', { loose: true }]
                // use these when in need
                // 'babel-plugin-transform-async-to-promises',
                // ['@babel/plugin-proposal-decorators', { legacy: true }],
                // ['@babel/plugin-transform-react-jsx', { pragma }]
            ]
        },
        include: /src/
    },
    {
        test: /\.(html)$/,
        loader: 'html-loader'
    },
    {
        test: /\.scss$/,
        use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            // because this will cause trouble in Firefox
            devMode || {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: 'inline',
                    plugins: [
                        require('postcss-preset-env')(),
                        devMode || require('cssnano')()
                    ].filter(notBoolean)
                }
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }
        ].filter(notBoolean) as (webpack.Loader | string)[]
    },
    {
        test: /\.(png|jpg|gif|svg|webp)$/,
        loader: 'url-loader',
        options: {
            name: devMode ? '[name].[ext]' : 'assets/[name].[ext]?[hash]',
            limit: 1024
        }
    }
]

const config: webpack.Configuration = {
    entry: {
        main: [__dirname + '/src/main.ts', __dirname + '/src/styles.scss'],
        polyfills: __dirname + '/src/polyfills.ts'
    },
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
                    test({ resource }, chunks) {
                        const onlyByPolyfill =
                            chunks.length === 1 && chunks[0].name === 'polyfills'
                        return /node_modules/.test(resource) && !onlyByPolyfill
                    },
                    name: 'vendors',
                    chunks: 'all',
                    minChunks: 1,
                    minSize: 8192
                }
            }
        }
    },
    devServer: {
        contentBase: __dirname + '/dist',
        before(_, server) {
            // watch index.html changes
            (server as any)._watch(__dirname + '/src/index.html')
        },
        clientLogLevel: 'warning',
        hot: true
    },
    mode: devMode ? 'development' : 'production',
    module: { rules },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        // only in dev
        devMode && new webpack.HotModuleReplacementPlugin(),
        // only in prod
        new ForkTsCheckerWebpackPlugin({
            tslint: true
        }),
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer',
            sync: 'polyfills',
            custom: {
                test: 'polyfills',
                attribute: 'nomodule'
            }
        }),
        devMode ||
            new MiniCssExtractPlugin({
                chunkFilename: 'styles.[contenthash].css'
            }),
        // because why not
        devMode ||
            new LicenseWebpackPlugin({
                perChunkOutput: false
            })
    ].filter(notBoolean) as webpack.Plugin[]
}

export default config
