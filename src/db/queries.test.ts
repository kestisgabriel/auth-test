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

	it('should throw error if email is already in db', async () => {
		const db = createTestDb()
		const email = 'a@b.com'
		const password = 'password'
		await insertUser(db, email, password)

		try {
			await insertUser(db, email, password)
		} catch (error) {
			console.log(error)
			expect(error).toBeInstanceOf(Error)
			// @ts-ignore
			expect(error.message).toMatch(/UNIQUE constraint failed/)
		}
	})
})
