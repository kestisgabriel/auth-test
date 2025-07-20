import { Hono } from 'hono'
import { dbConn } from './db/db'
import { signupValidator } from './schemas/signup-schema'
import { insertUser } from './db/queries'

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
		// put jwt in cookie
		// send OK
	} catch (error) {}
	// send error msg
	return c.text('User Authenticated')
})

export default app
