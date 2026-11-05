# Astro-AI layer — Phase 8 implementation

The AI layer adds the `src/ai/` module: a `SimulationContext` builder, an `AstroResponseSchema`, a static knowledge base, three prompt builders, and an `AstroAssistant` class that wraps an OpenAI-compatible API with automatic fallback. The implementation is intentionally isolated — no React, Zustand, or Phaser anywhere in the module — and designed to degrade gracefully when offline. All 13 review criteria pass with one minor observation worth noting.

Watch for: `clearTimeout` is called immediately after `fetch` resolves and again in the catch block — no leak — but the timer is **not** cleared on the JSON-parsing fallback paths after `!response.ok`. This is benign in this case (it already fired or will fire harmlessly), but worth a look. Confidence: confirmed.

**Verdict**: APPROVED

---

## High-level view

Every method on `AstroAssistant` catches all exceptions in a top-level `try/catch` and returns a validated fallback `AstroResponse` rather than re-throwing, satisfying the never-reject contract. `isAvailable()` guards `callAI` at the top of the method so no network call is ever attempted without an API key.

The knowledge base covers all eight required environmental event triggers (four lunar, four Martian) plus all five resource triggers and a `default` entry. The `getKnowledgeEntry` guard throws an invariant violation only if the `default` entry is somehow absent from the static array, which is an appropriate fail-fast for a genuine programmer error rather than a recoverable condition.

`buildSimulationContext` computes resource percentages as `(current / initial) * 100` clamped to `[0, 100]` via `Math.min / Math.max`, and radiation is surfaced as the raw `cumulativeRadiation_mSv` value rather than a percentage. Both are correct per the review spec.

All three prompt builders carry identical instructions to the model: do not invent specific numbers, do not claim live NASA data, respond only as a JSON object matching the `AstroResponse` schema. The schema itself enforces a minimum explanation length of 10 characters and a maximum of 500, rejecting empty strings and runaway responses alike.

---

<details>
<summary>Issues (1)</summary>

1. **Timer not cleared on post-fetch fallback paths** — After `clearTimeout(timer)` on line 127, subsequent early returns (`!response.ok`, `!isChatCompletionResponse`, content type check, `JSON.parse` failure, `safeParse` failure) all return without clearing the timer. The timer is already cleared at that point, so this causes no leak in production — but the `clearTimeout` call is semantically misplaced if the intent is "clear as late as possible". If the fetch timeout was `8000ms` and the response body was enormous, the timer could theoretically fire during `response.json()` and abort a request the code already considers succeeded. Consider moving `clearTimeout(timer)` to just before the final `return result.data` or wrapping the body-reading and parsing section in a guarded timer reset. Confidence: likely.

</details>

---

<details>
<summary>Details</summary>

### Timer placement after `response.ok`

`clearTimeout(timer)` is called on the line immediately after `await fetch(...)` returns. From that point the AbortController's signal is irrelevant to the fetch call itself — the response headers are in hand. However, `response.json()` can still throw if the connection drops mid-body, and `JSON.parse(content)` runs on AI-supplied content of unpredictable length. The timer will continue counting while those awaits complete. If the body read takes longer than whatever is left of the 8-second window, `controller.abort()` fires — but since `fetch` already resolved, the abort has no effect on `response.json()`. The functional risk is zero in the current browser implementations (abort after headers arrive does not affect body reading), but it creates a misleading maintenance signal: the timer is cleared "immediately" yet the abort callback could still fire during downstream processing.

The fix is simple: move `clearTimeout(timer)` to immediately before `return result.data` and `return this.getFallback(...)` calls, or use a `finally`-style guard. Given the code's existing structure, the cleanest approach is a small helper that clears the timer once and call it at every return site inside `try`.

### Knowledge-base coverage

All eight environmental event IDs from `LUNAR_EVENTS` and `MARTIAN_EVENTS` have exact-match entries in `KNOWLEDGE_BASE`:

- Lunar: `lunar-dust-contamination`, `lunar-night-begins`, `solar-flare-warning`, `micrometeorite-impact` ✓
- Martian: `regional-dust-storm`, `dust-storm-clears`, `co2-frost-formation`, `global-dust-storm` ✓
- Resource: `low-oxygen`, `low-water`, `low-food`, `low-energy`, `radiation-high` ✓
- Default fallback entry: `default` ✓

The `getKnowledgeEntry` fallback chain is sound: it tries the exact trigger, then falls back to `default`, then throws an invariant if `default` is missing. The throw path is unreachable with the static array as written, so the `Error` is a legitimate programmer-error guard rather than a user-facing path.

### Test coverage

The three test files cover the required behavioural territory:
- Schema: valid minimal, valid full, missing `explanation`, over-length `explanation`, missing `isGrounded` — five cases, all correct.
- Knowledge base: all lunar event IDs, all Martian event IDs, `default` entry, non-empty fields on every entry, unknown-trigger fallback.
- `AstroAssistant`: `isAvailable()` with undefined key, empty string key, and a non-empty key; all three public async methods return schema-valid responses when the assistant is unavailable (no mock of `fetch` needed because `callAI` short-circuits before making a network call).

Not tested: the live `callAI` path — fetch error fallback, invalid-JSON fallback, Zod validation failure fallback, and HTTP non-2xx fallback. These paths are architecturally correct by code inspection but lack unit-test coverage. Confidence: confirmed.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|------|-------------|
| `src/ai/simulation-context.ts` | New: `SimulationContext` interface + `buildSimulationContext` factory |
| `src/ai/schemas/astro-response.schema.ts` | New: Zod schema and inferred `AstroResponse` type |
| `src/ai/knowledge-base.ts` | New: 17-entry static knowledge base + `getKnowledgeEntry` |
| `src/ai/prompts/event-explanation.prompt.ts` | New: prompt builder for active event explanation |
| `src/ai/prompts/resource-change.prompt.ts` | New: prompt builder for resource-change explanation |
| `src/ai/prompts/decision-guidance.prompt.ts` | New: prompt builder for event decision guidance |
| `src/ai/astro-assistant.ts` | New: `AstroAssistant` class with fallback, timeout, type-guarded fetch |
| `src/ai/index.ts` | New: barrel export for entire `@ai/` module |
| `tests/unit/ai/astro-response.schema.test.ts` | New: 5 schema validation tests |
| `tests/unit/ai/knowledge-base.test.ts` | New: 5 knowledge-base coverage tests |
| `tests/unit/ai/astro-assistant.test.ts` | New: 6 behavioural tests (offline/fallback paths only) |

</details>
