import { Hono } from "hono";
import { signupValidator } from "./schemas/signup-schema";
import { dbConn } from "./db/db";
import { getUserByEmail, insertUser } from "./db/queries";
import { cookieOpts, generateToken } from "./helpers";
import { setCookie } from "hono/cookie";

const app = new Hono();

app
  .post("/api/signup", signupValidator, async (c) => {
    const db = dbConn();
    //validate the users input
    const { email, password } = c.req.valid("json");
    try {
      //insert the user into the database
      const userId = await insertUser(db, email, password);
      //generate a JWT Token
      const token = await generateToken(userId);
      //put that JWT token in cookie
      setCookie(c, "authToken", token, cookieOpts);
      //send success response
      return c.json({
        message: "User registered successfully",
        user: { id: userId, email },
      });
    } catch (error) {
      //send an error message
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        return c.json(
          {
            errors: ["Email already exists"],
          },
          409
        );
      }
      console.error("signup error: ", error);
      return c.json(
        {
          error: ["Internal server error"],
        },
        500
      );
    }
  })
  .post("/api/login", signupValidator,async (c) => {
    const db = dbConn()
    //validate user input
    const { email, password } = c.req.valid("json");

    try {
      //query user by email
      const user = getUserByEmail(db, email)
      if(!user){
        return c.json({ errors: ['Invalid credentials']}, 401)
      }
      //verify password matches
      const passwordMatch = await Bun.password.verify(password, user.password_hash)
      //if doesn't match then return 401
      if(!passwordMatch){
        return c.json({ errors: ['Invalid credentials']}, 401)
      }
      //if match generate JWT
      const token = await generateToken(user.id)
      //put JWT in a cookie
      setCookie(c, 'authToken', token, cookieOpts)
      //send success
      return c.json({
        message: 'Login successful',
        user: { id: user.id, email: email }
      })
    } catch (error) {
      //send error
      console.error(error)
      return c.json({ error: 'Internal Server Error'}, 500)
    }
  });

export default app;
