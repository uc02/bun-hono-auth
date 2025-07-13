import { Hono } from "hono";
import { signupValidator } from "./schemas/signup-schema";
import { dbConn } from "./db/db";
import { insertUser } from "./db/queries";
import { cookieOpts, generateToken } from "./helpers";
import { setCookie } from "hono/cookie";

const app = new Hono();

app.post("/api/signup", signupValidator, async (c) => {
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
});

export default app;
