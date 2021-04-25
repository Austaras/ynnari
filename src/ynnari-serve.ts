import webpack from 'webpack'

import config from './webpack.config'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebpackDevServer = require('webpack-dev-server/lib/Server')

const compiler = webpack(config)

const server = new WebpackDevServer(compiler, config.devServer)

server.listen(8080, '127.0.0.1', () => {})
