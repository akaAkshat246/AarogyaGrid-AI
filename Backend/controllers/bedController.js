import { bedSchema } from '../services/validation.js';
import { store, ok, requirePHC } from './helpers.js';
export const getBeds = async (req, res) => ok(res, await store(req).get('beds', req.params.phcId));
export const updateBeds = async (req, res) => {
  const data = bedSchema.parse(req.body); const phcId = req.params.phcId;
  await requirePHC(req, phcId);
  ok(res, await store(req).put('beds', phcId, { phcId, ...data, availableBeds: data.totalBeds - data.occupiedBeds }));
};
