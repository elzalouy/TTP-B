import { config } from 'dotenv';
import buildDevLogger from './dev-logger'
import buildProdLogger from './prod-logger'

config()

let logger:any = null

if (process.env.NODE_ENV === 'development') {
    logger = buildDevLogger
} else {
    logger = buildProdLogger
}

export default logger