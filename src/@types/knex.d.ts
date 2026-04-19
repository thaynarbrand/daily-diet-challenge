// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string,
            name: string
            session_id
        }
        meals: {
            id: string
            name: string
            description: string
            created_at: string
            updated_at: string
            user_id: string
            is_within_diet: boolean
            date: Date
        }
    }
}