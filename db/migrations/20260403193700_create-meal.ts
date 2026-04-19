import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').defaultTo(knex.fn.uuid()).primary()
        table.boolean('is_within_diet').notNullable()
        table.text('description').notNullable()
        table.uuid('user_id').references('users.id').notNullable()
        table.date('date').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}

