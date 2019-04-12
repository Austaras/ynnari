import webpack from 'webpack'

import CleanWebpackPlugin from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { LicenseWebpackPlugin } from 'license-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin'

const modeArg: string | undefined = process.argv
    .filter(str => str.startsWith('--mode'))[0]
const mode = modeArg !== undefined ?
    modeArg.split('=')[1].trim() : 'development'
const devMode = mode !== 'production'

const rules: webpack.RuleSetRule[] = [
    {
        test: /\.scss$/,
        use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader, {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }, {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }
        ]
    }, {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
            transpileOnly: devMode
        },
        include: /src/,
    }, {
        test: /\.(html)$/,
        loader: 'html-loader'
    }, {
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
        polyfills: __dirname + '/src/polyfills.ts',
        main: [
            __dirname + '/src/main.ts',
            __dirname + '/src/styles.scss'
        ],
    },
    devtool: devMode ?
        'inline-cheap-module-source-map' : 'nosources-source-map',
    output: {
        path: __dirname + '/dist',
        filename: devMode ? '[name].js' : '[name].[contenthash].js'
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
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
        devMode && new ForkTsCheckerWebpackPlugin({
            tslint: true,
        }),
        devMode && new webpack.HotModuleReplacementPlugin(),
        // only in prod
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer',
            sync: 'polyfills',
            custom: {
                test: 'polyfills',
                attribute: 'nomodule'
            }
        }),
        devMode || new MiniCssExtractPlugin({
            chunkFilename: 'styles.[contenthash].css'
        }),
        // because why not
        devMode || new LicenseWebpackPlugin({
            perChunkOutput: false
        })
    ].filter((i): i is webpack.Plugin => typeof i !== 'boolean')
}

export default config
