import fastify from 'fastify'
import { env } from './env/index.js'
import { userRoutes } from './routes/userRoutes.js'
import { mealsRoutes } from './routes/mealsRoutes.js'
import fastifyCookie from '@fastify/cookie'

const app = fastify()
app.register(fastifyCookie)

app.register(userRoutes, {
    prefix: 'users'
})

app.register(mealsRoutes, {
    prefix: 'meals'
})


app.listen({ port: env.PORT }, () => {
    console.log("Server running on port " + env.PORT)
})