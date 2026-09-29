import test from 'node:test';
import assert from 'node:assert/strict';
import { createAIService } from '../services/aiService.js';
const config = { AI_URL: 'http://localhost:8000/', AI_PREDICT_PATH: '/predict', AI_TIMEOUT_MS: 10, AI_API_KEY: 'test-key' };
test('AI forwards JSON and API key to configured endpoint', async () => {
  const predict = createAIService(config, async (url, options) => {
    assert.equal(url, 'http://localhost:8000/predict');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.equal(JSON.parse(options.body).medicine, 'Insulin');
    return Response.json({ risk: 'HIGH' });
  });
  assert.deepEqual(await predict({ medicine: 'Insulin' }), { risk: 'HIGH' });
});
test('AI maps upstream errors and invalid JSON to 502', async () => {
  for (const response of [new Response('bad', { status: 500 }), new Response('invalid'), Response.json([])]) {
    await assert.rejects(createAIService(config, async () => response)({}), { status: 502 });
  }
});
test('AI timeout cancels upstream request and returns 504', async () => {
  const predict = createAIService(config, (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  await assert.rejects(predict({}), { status: 504 });
});
