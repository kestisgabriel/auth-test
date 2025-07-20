import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test'
import app from '.'
import { createTestDb } from './test/test-db'
import { Database } from 'bun:sqlite'
import { loginReq, logoutReq, signupReq } from './test/test-helpers'

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
			user: { id: expect.any(String), email: 'a@b.com' },
		})
		const cookies = res.headers.get('Set-Cookie')
		expect(cookies).toMatch(/authToken=/)
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

describe('login endpoint', () => {
	it('should login user', async () => {
		// signup user
		const req = signupReq()
		const res = await app.fetch(req)

		// login user
		const req2 = loginReq()
		const res2 = await app.fetch(req2)
		const data = await res2.json()
		expect(res.status).toBe(200)
		expect(data).toEqual({
			message: 'User logged in successfully',
			user: { id: expect.any(String), email: 'a@b.com' },
		})
		const cookies = res2.headers.get('set-cookie')
		expect(cookies).toMatch(/authToken=/)
	})

	it('should return 400 if missing email or password is missing', async () => {
		const req = loginReq('', '')
		const res = await app.fetch(req)
		const data = await res.json()
		expect(res.status).toBe(400)
		console.log(data)
		expect(data).toEqual({
			errors: [
				'Invalid email address',
				'Password must be at least 8 characters',
			],
		})
	})

	it('should return 401 if incorrect password provided', async () => {
		const req = signupReq()
		await app.fetch(req)

		const req2 = loginReq('a@b.com', 'wrong-password')
		const res = await app.fetch(req2)

		const data = await res.json()
		expect(res.status).toBe(401)
		expect(data).toEqual({
			errors: ['Invalid credentials'],
		})
	})
})

describe('logout endpoint', () => {
	it('should logout user', async () => {
		const res = await app.fetch(logoutReq())
		const data = await res.json()

		expect(res.status).toBe(200)
		expect(data).toEqual({
			message: 'User logged out successfully',
		})

		const cookies = res.headers.get('set-cookie')
		expect(cookies).toMatch(/authToken=;/)
	})
})
