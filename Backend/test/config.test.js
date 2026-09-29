import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../config/env.js';
test('production rejects authentication bypass', () => {
  assert.throws(() => parseEnv({ AI_URL: 'http://localhost:8000', NODE_ENV: 'production', DEV_SKIP_AUTH: 'true' }), /must be false/);
  assert.equal(parseEnv({ AI_URL: 'http://localhost:8000', NODE_ENV: 'production' }).skipAuth, false);
});
test('configuration rejects invalid port, URL protocol and timeout', () => {
  for (const override of [{ PORT: 0 }, { AI_URL: 'file:///tmp/model' }, { AI_TIMEOUT_MS: -1 }]) {
    assert.throws(() => parseEnv({ AI_URL: 'http://localhost:8000', ...override }));
  }
});
