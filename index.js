const express = require('express')
const session = require('express-session')
const Redis = require('ioredis')
const connectRedis = require('connect-redis')

const client = require('./utils/sso.js')

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
		throw new Error('TOKEN MISMATCH: session might be hijacked!');
	}

	const userData = await client.getUserInfo(code); 
	res.json(userData)	
})

app.listen(app.get('port'), () => {
	console.log('Sever started on port 3000');
})

