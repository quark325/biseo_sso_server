import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import connectRedis from 'connect-redis'

import routes from './routes'

const app = express()
const RedisStore = connectRedis(session)
const redisClient = new Redis(3001)

app.use(express.json())
app.use(express.static('public'))

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.REDIS_SECRET,
	store: new RedisStore({
		client: redisClient
	}),
	cookie: {maxAge: 60000},
}))

app.set('jwt-secret', process.env.JWT_SECRET)

app.get('/', (req, res) => {
	res.sendFile('index.html')
})
app.use('/api', routes)

app.set('port', 3000)

export default app;
