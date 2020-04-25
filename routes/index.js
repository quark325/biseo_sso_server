import express from 'express'

import auth from '../controllers/auth.js'

const router = express.Router()

router.post('/login', auth.login)
router.get('/login/callback', auth.loginCallback)

module.exports = router

