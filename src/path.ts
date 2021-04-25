import { realpathSync } from 'fs'

export const appPath = realpathSync(process.cwd())
