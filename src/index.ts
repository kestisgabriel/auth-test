import { Hono } from 'hono'
import { dbConn } from './db/db'

const app = new Hono()

app.get('/', (c) => {
	dbConn()
	return c.text('Hello Hono!')
})

app.post('/api/signup', (c) => {
	// validate input
	// inser user into db
	// gen jwt
	// put jwt in cookie
	// send OK
	// send error msg
	return c.text('User Authenticated')
})

export default app
