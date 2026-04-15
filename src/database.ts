import { type Knex, knex as setupKnex } from "knex";
import 'dotenv/config'
import { env } from "./env";



export const config: Knex.Config = {
    useNullAsDefault: true,
    client: 'sqlite3',
    connection: {
        filename: env.DATABASE_URL
    },
    migrations: {
        extension: 'ts',
        directory: './db/migrations'
    }
}

export const knex = setupKnex(config)