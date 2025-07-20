export const signupReq = (email = 'z@z.com', password = 'password') => {
	return new Request('http://localhost/api/signup', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email,
			password,
		}),
	})
}
