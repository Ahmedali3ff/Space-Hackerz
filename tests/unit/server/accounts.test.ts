// Account rules shared by the Express routes and the /api/auth function. Uses a throwaway SQLite file.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

type Accounts = typeof import('../../../server/lib/accounts')
let accounts: Accounts

beforeAll(async () => {
  process.env['DB_PATH'] = path.join(mkdtempSync(path.join(tmpdir(), 'sh-')), 'test.db')
  process.env['AUTH_SECRET'] = 'test-secret'
  accounts = await import('../../../server/lib/accounts')
})

describe('password policy', () => {
  it('rejects short passwords and passwords without a letter or a number', () => {
    expect(accounts.passwordProblem('ab1')).not.toBeNull()
    expect(accounts.passwordProblem('12345678')).not.toBeNull()
    expect(accounts.passwordProblem('abcdefgh')).not.toBeNull()
  })
  it('accepts a long password with a letter and a number', () => {
    expect(accounts.passwordProblem('Secret123')).toBeNull()
  })
})

describe('register and login', () => {
  it('registers once, then refuses the same email', () => {
    const first = accounts.registerAccount({ email: 'Cmd@Example.com', password: 'Secret123', name: 'Ada' })
    expect(first.status).toBe(201)
    expect(typeof first.body['token']).toBe('string')
    expect(accounts.registerAccount({ email: 'cmd@example.com', password: 'Secret123', name: 'Ada' }).status).toBe(409)
  })

  it('logs in with the right password (email is case-insensitive) and rejects the wrong one', () => {
    expect(accounts.loginAccount({ email: 'CMD@example.com', password: 'Secret123' }).status).toBe(200)
    expect(accounts.loginAccount({ email: 'cmd@example.com', password: 'Wrong1234' }).status).toBe(401)
    expect(accounts.loginAccount({ email: 'nobody@example.com', password: 'Secret123' }).status).toBe(401)
  })

  it('rejects a weak password at registration', () => {
    expect(accounts.registerAccount({ email: 'weak@example.com', password: 'short', name: 'Weak' }).status).toBe(400)
  })

  it('treats a corrupted password hash as a failed login, not an error', () => {
    expect(accounts.verifyPassword('Secret123', 'not-a-valid-hash')).toBe(false)
    expect(accounts.verifyPassword('Secret123', 'abc:zz')).toBe(false)
  })
})
