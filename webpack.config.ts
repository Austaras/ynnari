import webpack from 'webpack'

import CleanWebpackPlugin from 'clean-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

type Parameter = Record<string, any>

const config: (env: Parameter, args: Parameter) => webpack.Configuration =
    (_: Parameter, args: Parameter) => {
        const devMode = args.mode !== 'production'
        return {
            entry: [
                __dirname + '/src/main.ts',
                __dirname + '/src/styles.scss'
            ],
            devtool: devMode ?
                'cheap-module-eval-source-map' : 'nosources-source-map',
            output: {
                path: __dirname + '/dist',
                filename: devMode ? '[name].js' : '[name].[contenthash].js'
            },
            optimization: {
                runtimeChunk: 'single',
                // minimize: false,
                splitChunks: {
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
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: [
                            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                            'css-loader',
                            'sass-loader'
                        ]
                    },
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: devMode
                        },
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.(html)$/,
                        loader: 'html-loader'
                    },
                    {
                        test: /\.(png|jpg|gif|svg|webp)$/,
                        loader: 'url-loader',
                        options: {
                            name: devMode ? '[name].[ext]' : 'assets/[name].[ext]?[hash]',
                            limit: 1024
                        }
                    }
                ],
            },
            resolve: {
                extensions: ['.tsx', '.ts', '.js']
            },
            plugins: [
                new CleanWebpackPlugin(),
                new HtmlWebpackPlugin({
                    template: 'src/index.html'
                }),
                !devMode && new MiniCssExtractPlugin({
                    chunkFilename: 'styles.[contenthash].css'
                }),
                devMode && new ForkTsCheckerWebpackPlugin({
                    tslint: true
                }),
                devMode && new webpack.HotModuleReplacementPlugin()
            ].filter((i): i is webpack.Plugin => i !== false)
        }
    }

export default config
