import { resolve } from 'path'
import { register } from 'ts-node'

import { appPath } from './path'
import internalConfig from './webpack.config'

register({ transpileOnly: true })

export function overriderWebpack() {
    const customPath = resolve(appPath, './extra-webpack.config')

    let config = internalConfig

    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const external = require(customPath)

        // transpiled esmodule
        if (external.default) {
            config = external.default
        } else {
            config = external
        }
    } catch (e: any) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            console.error(e)
        }
    }

    return config
}
