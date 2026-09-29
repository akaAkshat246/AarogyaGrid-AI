import { alertSchema, querySchema } from '../services/validation.js';
import { store, ok, requirePHC } from './helpers.js';
export const getAlerts = async (req, res) => {
  const q = querySchema.pick({ phcId: true, status: true }).parse(req.query);
  const rows = await store(req).list('alerts', q.phcId ? { phcId: q.phcId } : {});
  ok(res, rows.filter(v => !q.status || v.status === q.status));
};
export const createAlert = async (req, res) => {
  const data = alertSchema.parse(req.body); await requirePHC(req, data.phcId);
  ok(res, await store(req).create('alerts', { ...data, status: 'ACTIVE' }), 201);
};
export const resolveAlert = async (req, res) => ok(res,
  await store(req).mutate('alerts', req.params.id, old => ({
    ...old, status: 'RESOLVED', resolvedAt: old.resolvedAt ?? new Date().toISOString()
  })));
