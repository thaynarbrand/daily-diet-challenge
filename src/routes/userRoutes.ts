import { FastifyInstance } from "fastify"
import { knex } from "../database"
import z from "zod"

export const userRoutes = (app: FastifyInstance) => {
    app.post('/', async (request, reply) => {
        const payload = z.object({
            name: z.string()
        })
        const { name } = payload.parse(request.body)
        await knex('users').insert({ name })
        return reply.status(201).send()
    })

    app.get('/', async (_, reply) => {
        const list = await knex('users').select('*')
        return reply.status(200).send(list)
    })
}

