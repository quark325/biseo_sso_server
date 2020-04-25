const express = require('express')
const session = require('express-session')
const Redis = require('ioredis')
const connectRedis = require('connect-redis')

const client = require('./utils/sso.js')

const app = express()
const RedisStore = connectRedis(session)
const redisClient = new Redis(3001)

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.REDIS_SECRET,
	store: new RedisStore({
		client: redisClient
	}),
	cookie: {maxAge: 60000},
	}))

app.listen(3000, () => {
	console.log('Sever started on port 3000');
})

