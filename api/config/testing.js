import dotenv from 'dotenv'

dotenv.config()

export const config = {
    dbUrl: process.env.TEST_DATABASE_URL
}