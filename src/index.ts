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
  .use("/api/*", csrf()) // hono's csrf middleware
  .use("/api/auth/*", jwt({ secret: process.env.JWT_SECRET!, cookie: "authToken" })) // protected routes
  .post("/api/signup", signupValidator, async (c) => {
    const db = dbConn()
    const { email, password } = c.req.valid("json") // validate user

    try {
      const userId = await insertUser(db, email, password) // generate UUID
      const token = await generateToken(userId) // get jwt token
      setCookie(c, "authToken", token, cookieOptions) // add token to cookie

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
  .post("/api/login", signupValidator, async (c) => {
    const db = dbConn()
    const { email, password } = c.req.valid("json")

    try {
      const user = getUserByEmail(db, email)

      if (!user) {
        return c.json({ errors: ["Invalid credentials"] }, 401)
      }

      const passwordMatch = await Bun.password.verify(password, user.password_hash)

      if (!passwordMatch) {
        return c.json({ errors: ["Invalid credentials"] }, 401)
      }

      const token = await generateToken(user.id)
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
  .post("/api/logout", (c) => {
    // stateless session - simply delete cookie
    deleteCookie(c, "authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })

    return c.json({ message: "User logged out successfully" }, 200)
  })
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
