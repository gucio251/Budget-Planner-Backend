import {Pool, types} from 'pg'
import dotenv from 'dotenv'
import 'babel-polyfill'
import config from './../config/index'

console.log(config)

dotenv.config();

console.log(process.env.NODE_ENV)

const DATE_OID = 1082
const TIMESTAMP_OID = 1114
types.setTypeParser(DATE_OID, (date) => date)
types.setTypeParser(TIMESTAMP_OID, (timestamp) => timestamp)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export default {
    query(text, params){
        return new Promise((resolve, reject) => {
            pool.query(text, params)
            .then((response) => {
                resolve(response)
            })
            .catch((err) => {
                reject(err)
            })
        })
    },

    async transaction(callback) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            try {
                await callback(client)
                client.query('COMMIT')
            } catch(error){
                client.query('ROLLBACK')
            }
        } finally {
                client.release()
            }
        },

    pool

}