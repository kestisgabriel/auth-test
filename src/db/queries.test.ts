import { describe, expect, it } from 'bun:test'
import { createTestDb } from '../test/test-db'
import { insertUser } from './queries'

describe('insertUser', () => {
	it('should insert a user into the database', async () => {
		const db = createTestDb()
		const email = 'a@b.com'
		const password = 'password'
		const userId = await insertUser(db, email, password)
		console.log(userId)
		expect(userId).toBeDefined()
	})
})
