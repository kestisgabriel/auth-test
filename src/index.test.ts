import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test'
import app from '.'
import { createTestDb } from './test/test-db'
import { Database } from 'bun:sqlite'
import { signupReq } from './test/test-helpers'

let db: Database

mock.module('../src/db/db.ts', () => {
	return {
		dbConn: () => db,
	}
})

beforeEach(() => {
	db = createTestDb()
})

afterEach(() => {
	db.close()
})

describe('signup endpoint', () => {
	it('should sign up user', async () => {
		const req = signupReq()
		const res = await app.fetch(req)
		const data = await res.json()
		expect(res.status).toBe(200)
		expect(data).toEqual({
			message: 'User registered successfully',
			user: { id: expect.any(String), email: 'z@z.com' },
		})
		const cookes = res.headers.get('Set-Cookie')
		expect(cookes).toMatch(/authToken=/)
	})

	it('should return 409 if user already exists', async () => {
		const req = signupReq()
		const res = await app.fetch(req)
		expect(res.status).toBe(200)

		const req2 = signupReq()
		const res2 = await app.fetch(req2)
		const data = await res2.json()

		expect(res2.status).toBe(409)
		expect(data).toEqual({
			errors: ['User already exists'],
		})
	})

	it('should return error if missing email or password', async () => {
		const req = signupReq('', '')
		const res = await app.fetch(req)
		const data = await res.json()
		console.log(data)

		expect(res.status).toBe(400)
		expect(data).toEqual({
			errors: [
				'Invalid email address',
				'Password must be at least 8 characters',
			],
		})
	})
})
