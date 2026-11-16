/**
 * Fixed-window rate limiter kept in memory. Enough for one API instance; if the API is
 * ever scaled to several replicas, move this to a shared store (e.g. Redis).
 */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records a hit; returns how many seconds to wait when the limit is exceeded, otherwise 0. */
  hit(key: string): number {
    const time = this.now();
    this.sweep(time);
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= time) {
      this.hits.set(key, { count: 1, resetAt: time + this.windowMs });
      return 0;
    }
    entry.count += 1;
    return entry.count > this.max ? Math.ceil((entry.resetAt - time) / 1000) : 0;
  }

  private sweep(time: number): void {
    if (this.hits.size < 5_000) return;
    for (const [key, entry] of this.hits) if (entry.resetAt <= time) this.hits.delete(key);
  }
}
