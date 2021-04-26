#!/usr/bin/env node
import { existsSync } from 'fs'
import { resolve } from 'path'
import webpack from 'webpack'

import { appPath } from './path'

import internalConfig from './webpack.config'

let config = internalConfig

const customPath = resolve(appPath, './extra-webpack.config')

if (existsSync(customPath)) {
    config = require(customPath)
}

webpack(config, (err, stats) => {
    if (err) {
        console.error(err)
        return
    }

    console.log(
        stats!.toString({
            chunks: true, // Makes the build much quieter
            colors: true // Shows colors in the console
        })
    )
})
