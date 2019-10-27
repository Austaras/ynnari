import { Plugin, Compiler } from 'webpack'
import HtmlWebpackPlugin, { Hooks } from 'html-webpack-plugin'
import { AsyncSeriesWaterfallHook } from 'tapable'

const js: string[] = []
const css: string[] = []

type Data = Hooks['beforeAssetTagGeneration'] extends AsyncSeriesWaterfallHook<infer E> ? E : never

export class MultiBuildPlugin implements Plugin {
    public apply(compiler: Compiler) {
        compiler.hooks.compilation.tap('HtmlWebpackMultiBuildPlugin', compilation => {
            const hooks: Hooks = (HtmlWebpackPlugin as any).getHooks(compilation)
            hooks.beforeAssetTagGeneration.tapAsync('HtmlWebpackMultiBuildPlugin', (data, cb) => {
                this.beforeAssetTag(data, cb)
            })
        })
        compiler.hooks.emit.tap('HtmlWebpackMultiBuildPlugin', compilation => {
            Object.keys(compilation.assets).forEach(assetName => {
                if (assetName.includes('main.css')) {
                    delete compilation.assets[assetName]
                }
            })
        })
    }
    public beforeAssetTag(data: Data, cb: any) {
        // don't need inline fix since I don't care about edge nor safari
        js.push(...data.assets.js)
        data.assets.js = js
        if (css.length === 0) {
            css.push(...data.assets.css)
        } else {
            data.assets.css = css
        }

        cb(null, data)
    }
}
