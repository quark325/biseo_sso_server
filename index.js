import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import connectRedis from 'connect-redis'
import jwt from 'jsonwebtoken';

import client from './utils/sso.js'
import { jwtSign } from './utils/jwt.js'

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

app.set('port', 3000)
app.set('jwt-secret', process.env.JWT_SECRET)

app.get('/', (req, res) => {
	res.sendFile('index.html')
})

app.post('/login', (req, res) => {
	const { url, state } = client.getLoginParams();
	req.session.state = state; // state 값을 session에 저장합니다.
	res.redirect(url); // 사용자를 loginUrl로 redirect 시킵니다.
})

app.get('/account/login/callback', async (req, res) => {
	const {code, state} = req.query
	const stateBefore = req.session.state 
	if (stateBefore !== state) {
		res.status(401).json({
			error: 'TOKEN MISMATCH: session might be hijacked!',
			status: 401,
		})
		return
	}
	
	const user = await client.getUserInfo(code); 
	const token = jwtSign (user, app.get('jwt-secret'))
	
	console.log('jwt-token:', token)
	res.status(200).json({
		token: token,
		status: 200,
	})	
})

app.listen(app.get('port'), () => {
	console.log('Sever started on port 3000');
})

