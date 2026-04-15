import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    if (knex.client.config.client === 'sqlite3') {
        await knex.raw(`
            ALTER TABLE meals 
            ADD COLUMN updated_at DATETIME
        `)
    } else {
        await knex.schema.alterTable('meals', (table) => {
            table.dateTime('updated_at').defaultTo(knex.fn.now())
        })
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('meals', (table) => {
        table.dropColumn('updated_at')
    })
}