import { footfallSchema } from '../services/validation.js';
import { store, ok, requirePHC } from './helpers.js';
export const getFootfall = async (req, res) => {
  await requirePHC(req, req.params.phcId);
  const rows = await store(req).list('footfall', { phcId: req.params.phcId });
  ok(res, rows.sort((a, b) => b.date.localeCompare(a.date)));
};
// One daily total per PHC; repeating a POST replaces the same day's total.
export const addFootfall = async (req, res) => {
  const data = footfallSchema.parse(req.body); await requirePHC(req, data.phcId);
  ok(res, await store(req).put('footfall', data.phcId + '_' + data.date, data));
};
