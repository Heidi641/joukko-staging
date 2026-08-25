# Codex task: JOUKKO final fixes and verification

Three previously known Playwright failures have now been fixed directly on `main`:

- progress bar accessibility (`role=progressbar` + aria values)
- `X-Content-Type-Options: nosniff` response header
- ambiguous `Rekisteröidy` locator in `tests/joukko-ux.spec.ts`

## Your task

1. Pull the latest `main`.
2. Inspect `npm audit` findings, especially the previously reported 5 high-severity issues.
3. Apply only safe dependency updates that preserve compatibility with Next.js, React, Supabase and Playwright. Do **not** run `npm audit fix --force` blindly.
4. Run the full JOUKKO review suite:
   - Playwright UX checks
   - auth/protected-route checks
   - mobile/responsiveness checks
   - accessibility checks
   - hardening/security checks
   - AI safety/static checks
5. Target: all 55 tests PASS.
6. If new failures appear, fix them in the same pass and rerun until green or until there is a clear blocker.
7. Do not enable production, live Stripe, real charges, or change business logic/pricing/contracts as part of this task.
8. Leave a concise summary in GitHub issue #2 with:
   - files changed
   - dependency/audit changes
   - final test result
   - remaining risks/blockers, if any

Do not mark JOUKKO release-ready based only on CI. FINAL_RELEASE_CHECKLIST.md must still be completed afterwards.
