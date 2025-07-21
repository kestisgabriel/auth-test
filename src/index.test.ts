import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test"
import app from "."
import { createTestDb } from "./test/test-db"
import { Database } from "bun:sqlite"
import { loginReq, logoutReq, signupReq } from "./test/test-helpers"

let db: Database

mock.module("../src/db/db.ts", () => {
  return {
    dbConn: () => db,
  }
})

// spin up test db in memory for each test
beforeEach(() => {
  db = createTestDb()
})

// close db after each test
afterEach(() => {
  db.close()
})

describe("signup endpoint", () => {
  it("should sign up user", async () => {
    const req = signupReq() // sign up new user
    const res = await app.fetch(req)
    const data = await res.json()

    expect(res.status).toBe(200)

    expect(data).toEqual({
      message: "User registered successfully",
      user: { id: expect.any(String), email: "a@b.com" },
    }) // successfully generated UUID should populate id key

    const cookies = res.headers.get("Set-Cookie")

    expect(cookies).toMatch(/authToken=/) // presence of string `authToken=` indicates cookie has been set
  })

  it("should return 409 if user already exists", async () => {
    const initialSignupReq = signupReq() // sign up new user
    const initialSignupRes = await app.fetch(initialSignupReq)

    expect(initialSignupRes.status).toBe(200)

    const req = signupReq() // try to sign up same user again
    const res = await app.fetch(req)
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data).toEqual({
      errors: ["User already exists"],
    }) // 409 passes test - correctly identifying that user already exists
  })

  it("should return error if missing email or password", async () => {
    const req = signupReq("", "") // intentionally sign up user with empty email and password
    const res = await app.fetch(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data).toEqual({
      errors: ["Invalid email address", "Password must be at least 8 characters"],
    }) // 400 passes test - correctly identifying that email and password is missing
  })
})

describe("login endpoint", () => {
  it("should login user", async () => {
    const initialSignupReq = signupReq() // sign up new user
    const initialSignupRes = await app.fetch(initialSignupReq)

    expect(initialSignupRes.status).toBe(200)

    // proceed with logging in user
    const req = loginReq()
    const res = await app.fetch(req)
    const data = await res.json()

    expect(data).toEqual({
      message: "User logged in successfully",
      user: { id: expect.any(String), email: "a@b.com" },
    }) // successfully generated UUID should populate id key

    const cookies = res.headers.get("set-cookie")

    expect(cookies).toMatch(/authToken=/) // presence of string `authToken=` indicates cookie has been set
  })

  it("should return 400 if missing email or password is missing", async () => {
    const req = loginReq("", "") // manually assign empty login fields
    const res = await app.fetch(req)

    expect(res.status).toBe(400) // 400 passes test - correctly identifying that email and password is missing

    const data = await res.json()

    expect(data).toEqual({
      errors: ["Invalid email address", "Password must be at least 8 characters"],
    })
  })

  it("should return 401 if incorrect password provided", async () => {
    const initialSignupReq = signupReq() // sign up new user
    await app.fetch(initialSignupReq)

    const req = loginReq("a@b.com", "wrong-password") // login user with incorrect password
    const res = await app.fetch(req)
    const data = await res.json()

    expect(res.status).toBe(401)
    expect(data).toEqual({
      errors: ["Invalid credentials"],
    }) // 401 passes test - correctly identifying that incorrect password was provided
  })
})

describe("logout endpoint", () => {
  it("should logout user", async () => {
    const res = await app.fetch(logoutReq())

    expect(res.status).toBe(200)

    const data = await res.json()

    expect(data).toEqual({
      message: "User logged out successfully",
    })

    const cookies = res.headers.get("Set-Cookie")

    expect(cookies).toMatch(/authToken=;/) // empty string `=;` indicates cookie has been deleted
  })
})
