import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import app from ".";
import { createTestDb } from "./test/text-db";
import { Database } from 'bun:sqlite'
import { signupReq } from "./test/test-helpers";

let db: Database

mock.module('../src/db/db.ts', () => {
  return {
    dbConn: () => db
  }
})

beforeEach(() => {
  db = createTestDb()
})

afterEach(() => {
  db.close()
})

describe("signup endpoint", () => {
  it("should signup a user", async () => {
    const req = signupReq()
    const res = await app.fetch(req);
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({
      message: 'User registered successfully',
      user: { id: expect.any(String), email: 'test@test.com'}
    })
     
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
  });
});
