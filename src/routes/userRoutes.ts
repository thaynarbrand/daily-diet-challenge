import { FastifyInstance } from "fastify"
import { knex } from "../database"
import z from "zod"
import { randomUUID } from "node:crypto"

export const userRoutes = (app: FastifyInstance) => {
    app.post('/', async (request, reply) => {
        const payload = z.object({
            name: z.string()
        })
        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()
            reply.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
        }
        const { name } = payload.parse(request.body)
        await knex('users').insert({ name, session_id: sessionId })
        return reply.status(201).send()
    })

    app.get('/', async (_, reply) => {
        const list = await knex('users').select('*')
        return reply.status(200).send(list)
    })
}

