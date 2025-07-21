import { Hono } from "hono"
import { dbConn } from "./db/db"
import { signupValidator } from "./schemas/signup-schema"
import { getUserByEmail, getUserById, insertUser } from "./db/queries"
import { cookieOptions, generateToken } from "./helpers"
import { deleteCookie, setCookie } from "hono/cookie"
import { csrf } from "hono/csrf"
import { jwt } from "hono/jwt"

const app = new Hono()

app.get("/", (c) => {
  dbConn()
  return c.text("Hello Hono!")
})

app
  // middleware
  .use("/api/*", csrf())
  .use("/api/auth/*", jwt({ secret: process.env.JWT_SECRET!, cookie: "authToken" }))

  // signup
  .post("/api/signup", signupValidator, async (c) => {
    const db = dbConn()
    // validate input
    const { email, password } = c.req.valid("json")

    // insert user into db
    try {
      const userId = await insertUser(db, email, password)
      // generate jwt
      const token = await generateToken(userId)
      // put jwt in cookie
      setCookie(c, "authToken", token, cookieOptions)

      return c.json({
        message: "User registered successfully",
        user: { id: userId, email },
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
        return c.json({ errors: ["User already exists"] }, 409)
      }
      console.error("Signup error:", error)
      return c.json({ errors: ["Internal server error"] }, 500)
    }
  })

  // login
  .post("/api/login", signupValidator, async (c) => {
    const db = dbConn()
    // validte user input
    const { email, password } = c.req.valid("json")

    try {
      // query user by email
      const user = getUserByEmail(db, email)
      if (!user) {
        return c.json({ errors: ["Invalid credentials"] }, 401)
      }
      // verify password match
      const passwordMatch = await Bun.password.verify(password, user.password_hash)
      // !match = return 401
      if (!passwordMatch) {
        return c.json({ errors: ["Invalid credentials"] }, 401)
      }
      // match = generate jwt
      const token = await generateToken(user.id)
      // put jwt in cookie
      setCookie(c, "authToken", token, cookieOptions)

      return c.json(
        {
          message: "User logged in successfully",
          user: { id: user.id, email: email },
        },
        200
      )
    } catch (error) {
      console.error(error)
      return c.json({ error: ["Internal Server Error"] }, 500)
    }
  })

  // logout
  .post("/api/logout", (c) => {
    deleteCookie(c, "authToken", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    })

    return c.json({ message: "User logged out successfully" }, 200)
  })

  // get current user
  .get("/api/auth/me", async (c) => {
    const db = dbConn()
    const payload = c.get("jwtPayload")

    try {
      const user = getUserById(db, payload.sub)
      if (!user) {
        return c.json({ error: ["User not found"] }, 404)
      }

      return c.json({ id: user.id, email: user.email }, 200)
    } catch (error) {
      console.error("Error fetching user:", error)
      return c.json({ error: ["Internal Server Error"] }, 500)
    }
  })

export default app
