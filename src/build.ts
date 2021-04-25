import webpack from 'webpack'

import config from './webpack.config'

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
