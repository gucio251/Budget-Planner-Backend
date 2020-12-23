import { merge } from 'lodash'
const env = process.env.NODE_ENV || 'development'

const baseConfig = {
    env,
    isDev: env === 'development',
    isTest: env === 'testing',
}

let envConfig = {}

switch (env) {
    case 'dev':
    case 'development':
        envConfig = require('./dev').config
        envConfig.port = 5432
        break
    case 'test':
    case 'testing':
        envConfig = require('./testing').config
        envConfig.port = 5432
        break
    default:
        envConfig = require('./dev').config
        envConfig.port = 5432
}

export default merge(baseConfig, envConfig)