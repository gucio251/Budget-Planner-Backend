import {Pool, types} from 'pg'
import {parse} from 'pg-connection-string'
import dotenv from 'dotenv'
import 'babel-polyfill'
import config from './../config/index'


dotenv.config();

const DATE_OID = 1082
const TIMESTAMP_OID = 1114
types.setTypeParser(DATE_OID, (date) => date)
types.setTypeParser(types.builtins.INT8, (value) => {
  return parseInt(value);
});

types.setTypeParser(types.builtins.FLOAT8, (value) => {
  return parseFloat(value);
});

types.setTypeParser(types.builtins.NUMERIC, (value) => {
  return parseFloat(value);
});

types.setTypeParser(TIMESTAMP_OID, (timestamp) => timestamp)

const finalConfig = parse(process.env.DATABASE_URL);

config.ssl = {
  rejectUnauthorized: false,
};

const pool = new Pool(finalConfig);

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