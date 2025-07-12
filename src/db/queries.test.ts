import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { insertUser } from './queries';
import { createTestDb } from '../test/text-db';
import { Database } from 'bun:sqlite'

  let db : Database

  beforeEach(() => {
    db = createTestDb()
  })

  afterEach(() => {
    db.close();
  })


describe('insertUser', () => {
  it('should insert a user into the database', async () => {
    const email = 'text@text.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password)
    console.log(userId)
    expect(userId).toBeDefined();
  });

  it('should throw an error if the email is already in the db', async () => {
    const email = 'test@test.com'
    const password = 'password123'
    await insertUser(db, email, password)

    try {
      await insertUser(db, email, password)
    } catch (error) {
      console.log(error)
      expect(error).toBeInstanceOf(Error)
      // @ts-ignore
      expect(error.message).toMatch(/UNIQUE constraint failed/)
    }
  })

  it('should throw an error if the password is empty', async () => {
    const email = 'test@test.com'
    const password = ''
    try {
      await insertUser(db, email, password)
    } catch (error) {
     expect(error).toBeInstanceOf(Error)
     // @ts-ignore
     expect(error.message).toMatch(/password must not be empty/)
    }
  })
})