import { resolve } from 'path'
import webpack from 'webpack'

import { appPath } from './path'
import internalConfig from './webpack.config'

export function overriderWebpack() {
    const customPath = resolve(appPath, './extra-webpack.config')

    let config = internalConfig

    try {
        config = require(customPath)
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            console.error(e)
        }
    }

    return config
}
