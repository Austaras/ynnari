#!/usr/bin/env node
import webpack from 'webpack'

import { overriderWebpack } from './override'

const config = overriderWebpack()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebpackDevServer = require('webpack-dev-server/lib/Server')

const compiler = webpack(config)
const devServer = { ...config.devServer }

devServer.host ??= 'localhost'

const server = new WebpackDevServer(config.devServer, compiler)

server.startCallback(() => {})
