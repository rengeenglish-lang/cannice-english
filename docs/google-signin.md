# Google sign-in / sign-up

Enabled only when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set; otherwise the Google buttons are hidden and nothing changes. Authorized redirect URI: `https://netfener.com/api/auth/callback/google`.

- Google identities are matched to accounts by **verified** e-mail (case-insensitive). First use creates a STUDENT account with no password. Roles and `isActive` are never changed; deactivated accounts are refused.
- **Existing password account + Google with the same e-mail:** the password is removed on first Google link. Password sign-ups are not e-mail-verified, so otherwise someone could pre-register a victim's address and keep access after the victim signs in with Google. Consequence: that person must use Google from then on (the password form says so). Reversible policy decision.
- The session id is always the Netfener user id, never Google's subject. Sessions remain 8-hour JWTs; `getAuthContext` re-checks the user on every request.
- After Google, `/hesap/tamamla` records the article attribution (Phase 6 `src` tag) for accounts created in the last 15 minutes, then redirects to `next` or the dashboard/admin.
- CSP `form-action` now also allows `https://accounts.google.com`.
- Not covered by automated tests: the live round trip with Google (needs real client credentials). Tested: account mapping, race, linking, deactivated/unverified refusal, button visibility, redirect URL construction.
