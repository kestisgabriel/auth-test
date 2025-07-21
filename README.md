# Simple User Authentication

This is a backend for user registration. A user can sign-up, login, log out and access protected routes. Tests are included for all functionality.

## Stack

- Hono
- Bun (using runtime, package manager, test runner, bundler, built-in SQLite driver, and crypto functions)
- JSON Web Tokens (JWT)
- TypeScript
- SQLite
- Zod

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

To run tests:

```sh
bun test
```

open http://localhost:3000
