import webpack from 'webpack'

import CleanWebpackPlugin from 'clean-webpack-plugin'
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
            output: {
                path: __dirname + '/dist',
                filename: devMode ? '[name].js' : 'bundle.[hash].js'
            },
            devServer: {
                contentBase: './dist'
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
                        use: 'ts-loader',
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.(html)$/,
                        use: {
                            loader: 'html-loader',
                            options: {
                                attrs: ['img:src', 'link:href']
                            }
                        }
                    },
                    {
                        test: /\.(png|jpg|gif|svg|webp)$/,
                        loader: 'file-loader',
                        options: {
                            name: devMode ? '[name].[ext]' : '[name].[ext]?[hash]'
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
                new MiniCssExtractPlugin({
                    filename: devMode ? '[name].css' : '[name].[hash].css'
                }),
            ]
        }
    }

export default config
