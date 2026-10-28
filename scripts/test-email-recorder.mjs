// CI-only email transport recorder. Loaded explicitly by the browser-test server, never the app.
import fs from 'node:fs';
const target = new URL(process.env.DATABASE_URL || 'http://invalid');
if (process.env.CI !== 'true' || !['127.0.0.1', 'localhost'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Email recorder requires isolated CI database');
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (String(input) === 'https://api.resend.com/emails') {
    fs.appendFileSync('/tmp/netfener-test-mail.jsonl', JSON.stringify(JSON.parse(String(init.body))) + '\n');
    return Response.json({ id: 'ci-email-' + Date.now() });
  }
  return originalFetch(input, init);
};
