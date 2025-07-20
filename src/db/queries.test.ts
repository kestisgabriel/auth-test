import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import { createTestDb } from '../test/test-db'
import { insertUser } from './queries'
import { Database } from 'bun:sqlite'

let db: Database

beforeEach(() => {
	db = createTestDb()
})

afterEach(() => {
	db.close()
})

describe('insertUser', () => {
	it('should insert a user into the database', async () => {
		const email = 'a@b.com'
		const password = 'password'
		const userId = await insertUser(db, email, password)
		console.log(userId)
		expect(userId).toBeDefined()
	})

	it('should throw error if email is already in db', async () => {
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

	it('should throw error if password is empty', async () => {
		const email = 'a@b.com'
		const password = ''

		try {
			await insertUser(db, email, password)
		} catch (error) {
			console.log(error)
			expect(error).toBeInstanceOf(Error)
			// @ts-ignore
			expect(error.message).toMatch(/password must not be empty/)
		}
	})
})
