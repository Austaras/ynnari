#!/usr/bin/env node
import webpack from 'webpack'

import { overriderWebpack } from './override'

const config = overriderWebpack()

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
