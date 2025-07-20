import { sign } from 'hono/jwt'
import { CookieOptions } from 'hono/utils/cookie'

export const generateToken = async (userId: string) => {
	const secret = process.env.JWT_SECRET
	const now = Math.floor(Date.now() / 1000)
	const payload = {
		sub: userId, // subject
		iat: now, // issued at
		exp: now + 1 * 60 * 60, // expires in 1 hour
		// exp: now + 60 * 60 * 24 * 7, // expires in 7 days
	}

	const token = await sign(payload, secret!)
	return token
}

export const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict',
	path: '/',
	maxAge: 3600, // 1 hr
} as CookieOptions
