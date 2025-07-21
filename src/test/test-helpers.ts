export const signupReq = (email = "a@b.com", password = "password") => {
  return new Request("http://localhost/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export const loginReq = (email = "a@b.com", password = "password") => {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export const logoutReq = () => {
  return new Request("http://localhost/api/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}
