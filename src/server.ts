import fastify from 'fastify'
import { env } from './env/index.js'
import { userRoutes } from './routes/userRoutes.js'
import { mealsRoutes } from './routes/mealsRoutes.js'

const app = fastify()

app.register(userRoutes, {
    prefix: 'users'
})

app.register(mealsRoutes, {
    prefix: 'meals'
})


app.listen({ port: env.PORT }, () => {
    console.log("Server running on port " + env.PORT)
})