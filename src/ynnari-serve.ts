#!/usr/bin/env node
import { existsSync } from 'fs'
import { resolve } from 'path'
import webpack from 'webpack'

import { overriderWebpack } from './override'

const config = overriderWebpack()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebpackDevServer = require('webpack-dev-server/lib/Server')

const compiler = webpack(config)

const server = new WebpackDevServer(compiler, config.devServer)

server.listen(8080, '127.0.0.1', () => {})
