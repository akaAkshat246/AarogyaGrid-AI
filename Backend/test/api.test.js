import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';
import { memoryStore } from './support/memoryStore.js';
async function harness(t, options = {}) {
  const store = memoryStore();
  const app = createApp({ store, auth: { verifyIdToken: async token => {
    if (token !== 'valid-token') throw new Error('invalid');
    return { uid: 'test-user' };
  } }, config: { skipAuth: true, origins: ['http://localhost:5173'] },
    predict: async () => ({ risk: 'HIGH', daysRemaining: 2.4, predictedDemand: 52 }), ...options });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  return async (method, path, body, expected = 200, headers = {}) => {
    const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const json = await res.json(); assert.equal(res.status, expected, JSON.stringify(json)); return json;
  };
}
test('complete PHC resource workflow, aggregation, prediction and transfer lifecycle', async t => {
  const call = await harness(t);
  await call('GET', '/health');
  await call('GET', '/api/health/ready');
  const a = (await call('POST', '/api/phcs', { name: 'PHC A', district: 'Ghaziabad', state: 'UP', latitude: 0, longitude: 0 }, 201)).data;
  const b = (await call('POST', '/api/phcs', { name: 'PHC B', district: 'Ghaziabad', state: 'UP' }, 201)).data;
  assert.equal((await call('GET', '/api/phcs/' + a.id)).data.latitude, 0);
  await call('PUT', '/api/phcs/' + a.id, { name: 'Updated PHC' });
  assert.equal((await call('GET', '/api/phcs/' + a.id)).data.latitude, 0);
  assert.equal((await call('GET', '/api/phcs')).data.length, 2);
  const item = (await call('POST', '/api/inventory', { phcId: a.id, medicine: 'Insulin', quantity: 5, minimumStock: 10 }, 201)).data;
  await call('PUT', '/api/inventory/' + item.id, { dailyUsage: 2 });
  assert.equal((await call('GET', '/api/inventory/' + a.id)).data[0].quantity, 5);
  await call('PUT', '/api/beds/' + a.id, { totalBeds: 20, occupiedBeds: 6 });
  assert.equal((await call('GET', '/api/beds/' + a.id)).data.availableBeds, 14);
  await call('PUT', '/api/staff/' + a.id, { doctorsTotal: 2, doctorsPresent: 1, nursesTotal: 4, nursesPresent: 3 });
  assert.equal((await call('GET', '/api/staff/' + a.id)).data.doctors.present, 1);
  for (const patients of [30, 40]) await call('POST', '/api/footfall', { phcId: a.id, date: '2026-09-29', patients });
  assert.equal((await call('GET', '/api/footfall/' + a.id)).data.length, 1);
  const alert = (await call('POST', '/api/alerts', { phcId: a.id, type: 'STOCK', severity: 'CRITICAL', message: 'Low insulin' }, 201)).data;
  assert.equal((await call('GET', '/api/alerts?status=ACTIVE')).data.length, 1);
  const summary = (await call('GET', '/api/dashboard')).data;
  assert.equal(summary.totalPatients, 40); assert.equal(summary.availableBeds, 14);
  assert.equal(summary.criticalAlerts, 1); assert.equal(summary.medicineShortages, 1);
  assert.equal((await call('GET', '/api/dashboard?date=2026-09-28')).data.totalPatients, 0);
  await call('PUT', '/api/alerts/' + alert.id + '/resolve', {});
  assert.equal((await call('GET', '/api/alerts?status=ACTIVE')).data.length, 0);
  const transfer = (await call('POST', '/api/transfers', { fromPhcId: a.id, toPhcId: b.id, medicine: 'Insulin', quantity: 2 }, 201)).data;
  await call('PUT', '/api/transfers/' + transfer.id + '/status', { status: 'COMPLETED' }, 409);
  for (const status of ['APPROVED', 'IN_TRANSIT', 'COMPLETED', 'COMPLETED']) await call('PUT', '/api/transfers/' + transfer.id + '/status', { status });
  await call('PUT', '/api/transfers/' + transfer.id + '/status', { status: 'PENDING' }, 409);
  assert.equal((await call('GET', '/api/transfers?phcId=' + b.id)).data.length, 1);
  await call('POST', '/api/ai/predict', { phcId: a.id, medicine: 'Insulin', currentStock: 5, dailyUsage: 2 }, 201);
  assert.equal((await call('GET', '/api/ai/predictions/' + a.id)).data[0].result.risk, 'HIGH');
  await call('DELETE', '/api/inventory/' + item.id);
  await call('DELETE', '/api/inventory/' + item.id, undefined, 404);
  await call('DELETE', '/api/phcs/' + a.id);
  await call('GET', '/api/phcs/' + a.id, undefined, 404);
});
test('rejects invalid quantities, inconsistent counts, calendar dates and unknown fields', async t => {
  const call = await harness(t);
  await call('POST', '/api/phcs', { name: 'X' }, 400);
  await call('POST', '/api/inventory', { phcId: 'missing', medicine: 'X', quantity: -1 }, 400);
  await call('POST', '/api/inventory', { phcId: 'missing', medicine: 'X', quantity: 1 }, 404);
  await call('PUT', '/api/beds/x', { totalBeds: 2, occupiedBeds: 3 }, 400);
  await call('PUT', '/api/staff/x', { doctorsTotal: 1, doctorsPresent: 2, nursesTotal: 1, nursesPresent: 0 }, 400);
  await call('POST', '/api/footfall', { phcId: 'x', date: '2026-02-30', patients: 1 }, 400);
  await call('POST', '/api/phcs', { name: 'X', district: 'X', state: 'X', admin: true }, 400);
  await call('POST', '/api/transfers', { fromPhcId: 'x', toPhcId: 'x', medicine: 'X', quantity: 1 }, 400);
  await call('PUT', '/api/alerts/missing/resolve', {}, 404);
  await call('GET', '/nonexistent', undefined, 404);
});
test('Firebase authentication gate rejects missing and invalid tokens', async t => {
  const call = await harness(t, { config: { skipAuth: false, origins: [] } });
  await call('GET', '/health');
  await call('GET', '/api/phcs', undefined, 401);
  await call('GET', '/api/phcs', undefined, 401, { Authorization: 'Bearer invalid' });
  await call('GET', '/api/phcs', undefined, 200, { Authorization: 'Bearer valid-token' });
});
