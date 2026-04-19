import { FastifyInstance } from "fastify"
import { knex } from "../database"
import z from "zod"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"



export const mealsRoutes = (app: FastifyInstance) => {
    app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const payload = z.object({
            name: z.string(),
            isWithinDiet: z.boolean(),
            description: z.string(),
            userId: z.uuid(),
            date: z.coerce.date()
        })
        const checkedPayload = payload.safeParse(request.body)
        if (checkedPayload.error) {
            await reply.status(400).send({ message: z.prettifyError(checkedPayload.error) })
            return
        }
        const { data: { isWithinDiet, name, userId, description, date } } = checkedPayload
        const isValidUser = await knex('users').select('*').where({ id: userId }).first()

        if (!isValidUser) return reply.status(404).send({ message: "No user found" })

        await knex('meals').insert({ name, is_within_diet: isWithinDiet, user_id: userId, description, date })
        return reply.status(201).send()
    })

    app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const mealsList = await knex('meals').select('*').where({ user_id: request.user.id })
        return reply.status(200).send(mealsList)
    })

    app.get('/:mealId', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const params = z.object({
            mealId: z.uuid()
        })

        const checkedParams = params.safeParse(request.params)
        if (checkedParams.error) {
            await reply.status(400).send({ message: z.prettifyError(checkedParams.error) })
            return
        }

        const { data: { mealId } } = checkedParams
        const isValidMeal = await knex('meals').select('*').where({ id: mealId }).first()
        if (!isValidMeal) return reply.status(404).send({ message: 'Meal not found' })
        const meal = await knex('meals').select('*').where({ id: mealId, user_id: request.user.id }).first()
        if (!meal) {
            return reply.status(404).send('Meal not found   ')
        }
        return reply.status(200).send(meal)
    })

    app.put('/:mealId', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const params = z.object({
            mealId: z.uuid()
        })
        const payload = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            isWithinDiet: z.boolean().optional(),
            date: z.coerce.date().optional()
        })
        const checkedParams = params.safeParse(request.params)
        const checkedPayload = payload.safeParse(request.body)

        if (checkedParams.error || checkedPayload.error) {
            const error = checkedParams.error || checkedPayload.error
            await reply.status(400).send({ message: z.prettifyError(error!) })
            return
        }


        const { data: { mealId } } = checkedParams
        const { data: { date, description, isWithinDiet, name } } = checkedPayload

        const updateData = Object.fromEntries(
            Object.entries({
                name: name,
                description: description,
                date: date,
                is_within_diet: isWithinDiet
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            }).filter(([_, value]) => value !== undefined)
        )

        const meal = (await knex('meals').where({ id: mealId, user_id: request.user.id }).select("*"))
        if (!meal.length) {
            return reply.status(404).send("Meal not found.")
        }
        await knex('meals').update(updateData).where({ id: mealId })

        return reply.status(204).send()
    })

    app.get('/:userId/summary', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const params = z.object({
            userId: z.uuid()
        })

        const checkedParams = params.safeParse(request.params)

        if (checkedParams.error) {
            await reply.status(400).send({ message: z.prettifyError(checkedParams.error) })
            return
        }
        const { data: { userId } } = checkedParams

        const resumo = await knex('users')
            .select(
                'users.id as user_id',
                'users.name',
                knex.raw('COUNT(meals.id) as total_meals'),
                knex.raw('SUM(CASE WHEN meals.is_within_diet = 1 THEN 1 ELSE 0 END) as meals_within_diet'),
                knex.raw('SUM(CASE WHEN meals.is_within_diet = 0 THEN 1 ELSE 0 END) as meals_outside_diet')
            )
            .leftJoin('meals', 'users.id', 'meals.user_id')
            .where('users.id', userId)
            .groupBy('users.id')
            .first()

        await reply.status(200).send(resumo)
    })


    app.delete('/:mealId', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const params = z.object({
            mealId: z.uuid()
        })

        const checkedParams = params.safeParse(request.params)

        if (checkedParams.error) {
            await reply.status(400).send({ message: z.prettifyError(checkedParams.error) })
            return
        }
        const { data: { mealId } } = checkedParams
        const mealExists = await knex('meals').select('*').where({ id: mealId, user_id: request.user.id }).first()
        if (!mealExists) {
            await reply.status(404).send("No meal found")
        }
        const deletedMeal = await knex('meals').delete().where({ id: mealId }).returning('*')
        await reply.status(200).send(deletedMeal)
    })
}

