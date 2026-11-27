// Server-side mission rewards: XP is calculated on the server, and replays cannot farm XP.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

type Accounts = typeof import('../../../server/lib/accounts')
type Rewards = typeof import('../../../server/lib/rewards')
let accounts: Accounts
let rewards: Rewards

let token = ''
let accountId = ''

beforeAll(async () => {
  process.env['DB_PATH'] = path.join(mkdtempSync(path.join(tmpdir(), 'sh-rw-')), 'test.db')
  process.env['AUTH_SECRET'] = 'test-secret'
  accounts = await import('../../../server/lib/accounts')
  rewards = await import('../../../server/lib/rewards')
  const reg = await accounts.registerAccount({ email: 'rewards@example.com', password: 'Secret123', name: 'Rewarded' })
  token = String(reg.body['token'])
  accountId = (reg.body['account'] as { id: string }).id
})

describe('mission rewards', () => {
  it('awards the full XP for the first clear', async () => {
    const r = await rewards.completeMission(accountId, { missionId: 'm01', starsEarned: 3 })
    expect(r.status).toBe(200)
    expect(r.body['awardedXP']).toBe(rewards.xpForMission(3, 1))
  })

  it('does not award XP again for a replay with the same stars', async () => {
    const r = await rewards.completeMission(accountId, { missionId: 'm01', starsEarned: 3 })
    expect(r.body['awardedXP']).toBe(0)
  })

  it('a replay that improves stars only awards the difference', async () => {
    const r = await rewards.completeMission(accountId, { missionId: 'm02', starsEarned: 1 })
    expect(r.body['awardedXP']).toBe(rewards.xpForMission(1, 2))
    const up = await rewards.completeMission(accountId, { missionId: 'm02', starsEarned: 2 })
    expect(up.body['awardedXP']).toBe(rewards.xpForMission(2, 2) - rewards.xpForMission(1, 2))
  })

  it('a replay with fewer stars never lowers the result or awards XP', async () => {
    const r = await rewards.completeMission(accountId, { missionId: 'm02', starsEarned: 1 })
    expect(r.body['starsEarned']).toBe(2)
    expect(r.body['awardedXP']).toBe(0)
  })

  it('rejects invented mission ids, star counts and types', async () => {
    expect((await rewards.completeMission(accountId, { missionId: 'm21', starsEarned: 3 })).status).toBe(400)
    expect((await rewards.completeMission(accountId, { missionId: 'm03', starsEarned: 9 })).status).toBe(400)
    expect((await rewards.completeMission(accountId, { missionId: 'm03', starsEarned: 0 })).status).toBe(400)
    expect((await rewards.completeMission(accountId, { missionId: 'm03', starsEarned: '3' })).status).toBe(400)
  })

  it('keeps the rank in sync with the server total', async () => {
    const r = await rewards.completeMission(accountId, { missionId: 'm03', starsEarned: 3 })
    expect(r.body['totalXP']).toBeGreaterThan(0)
    expect(typeof r.body['title']).toBe('string')
  })

  it('token from registration is valid', async () => {
    expect(token.startsWith('st1.')).toBe(true)
  })
})
