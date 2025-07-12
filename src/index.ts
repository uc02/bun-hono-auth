import { Hono } from 'hono'
import { dbConn } from './db/db'

const app = new Hono()

app.get('/', (c) => {
  dbConn()
  return c.text('Hello Hono!')
})

export default app;
