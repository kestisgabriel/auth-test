import { Hono } from 'hono'
import { dbConn } from './db/db'
import { signupValidator } from './schemas/signup-schema'
import { insertUser } from './db/queries'
import { cookieOptions, generateToken } from './helpers'
import { setCookie } from 'hono/cookie'

const app = new Hono()

app.get('/', (c) => {
	dbConn()
	return c.text('Hello Hono!')
})

app.post('/api/signup', signupValidator, async (c) => {
	const db = dbConn()
	// validate input
	const { email, password } = c.req.valid('json')

	// insert user into db
	try {
		const userId = await insertUser(db, email, password)

		// generate jwt
		const token = await generateToken(userId)

		// put jwt in cookie
		setCookie(c, 'authToken', token, cookieOptions)

		// send OK
		return c.json({
			message: 'User registered successfully',
			user: { id: userId, email },
		})
	} catch (error) {
		// send error msg
		if (
			error instanceof Error &&
			error.message.includes('UNIQUE constraint failed')
		) {
			return c.json({ errors: ['User already exists'] }, 409)
		}
		console.error('Signup error:', error)
		return c.json({ errors: ['Internal server error'] }, 500)
	}
})

export default app
