// Run against your configured, running server. Creates clearly marked demo records.
import assert from 'node:assert/strict';
const base = process.env.BASE_URL ?? 'http://127.0.0.1:5000';
async function call(method, path, body) {
  const response = await fetch(base + path, {
    method, signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json',
      ...(process.env.FIREBASE_ID_TOKEN ? { Authorization: 'Bearer ' + process.env.FIREBASE_ID_TOKEN } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const json = await response.json();
  if (!response.ok) throw new Error(method + ' ' + path + ': ' + JSON.stringify(json));
  console.log('PASS', method, path);
  return json.data;
}
try {
  await call('GET', '/health'); await call('GET', '/api/health/ready');
  const suffix = new Date().toISOString();
  const phc = await call('POST', '/api/phcs', { name: 'Demo PHC A ' + suffix, district: 'Demo', state: 'Demo' });
  const other = await call('POST', '/api/phcs', { name: 'Demo PHC B ' + suffix, district: 'Demo', state: 'Demo' });
  const phcId = phc.id;
  await call('GET', '/api/phcs/' + phcId);
  await call('POST', '/api/inventory', { phcId, medicine: 'Insulin (demo)', quantity: 5, minimumStock: 10, dailyUsage: 2 });
  await call('GET', '/api/inventory/' + phcId);
  await call('PUT', '/api/beds/' + phcId, { totalBeds: 20, occupiedBeds: 6 });
  await call('GET', '/api/beds/' + phcId);
  await call('PUT', '/api/staff/' + phcId, { doctorsTotal: 2, doctorsPresent: 1, nursesTotal: 4, nursesPresent: 3 });
  await call('GET', '/api/staff/' + phcId);
  await call('POST', '/api/footfall', { phcId, date: new Date().toISOString().slice(0, 10), patients: 40 });
  await call('GET', '/api/footfall/' + phcId);
  const alert = await call('POST', '/api/alerts', { phcId, type: 'STOCK', severity: 'HIGH', message: 'Demo shortage' });
  await call('GET', '/api/alerts?phcId=' + phcId);
  await call('PUT', '/api/alerts/' + alert.id + '/resolve', {});
  const transfer = await call('POST', '/api/transfers', { fromPhcId: phcId, toPhcId: other.id, medicine: 'Insulin (demo)', quantity: 2 });
  for (const status of ['APPROVED', 'IN_TRANSIT', 'COMPLETED']) {
    await call('PUT', '/api/transfers/' + transfer.id + '/status', { status });
  }
  await call('GET', '/api/transfers?phcId=' + phcId);
  const dashboard = await call('GET', '/api/dashboard?phcId=' + phcId);
  assert.equal(dashboard.totalPatients, 40); assert.equal(dashboard.availableBeds, 14);
  if (process.argv.includes('--ai')) {
    await call('POST', '/api/ai/predict', { phcId, medicine: 'Insulin', currentStock: 5, dailyUsage: 2, patientFootfall: 40 });
    await call('GET', '/api/ai/predictions/' + phcId);
  }
  console.log('Smoke check complete. Demo PHCs retained:', phcId, other.id);
} catch (error) { console.error(error.message); process.exitCode = 1; }
