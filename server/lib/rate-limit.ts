/** Tiny in-memory fixed-window limiter. Returns true when the key is over the limit. */
export function createLimiter(max: number, windowMs: number): (key: string) => boolean {
  const hits = new Map<string, { count: number; resetAt: number }>()
  return (key: string): boolean => {
    const now = Date.now()
    const entry = hits.get(key)
    if (!entry || entry.resetAt < now) { hits.set(key, { count: 1, resetAt: now + windowMs }); return false }
    entry.count += 1
    return entry.count > max
  }
}
