import { describe, expect, it } from 'bun:test'
import { dbConn } from './db'
import { insertUser } from './queries'

describe('insertUser', () => {
	it('should insert a user into the database', async () => {
		const db = dbConn()
		const email = 'a@b.com'
		const password = 'password'
		const userId = await insertUser(db, email, password)
		console.log(userId)
		expect(userId).toBeDefined()
	})
})
