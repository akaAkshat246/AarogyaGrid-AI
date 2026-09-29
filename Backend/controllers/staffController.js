import { staffSchema } from '../services/validation.js';
import { store, ok, requirePHC } from './helpers.js';
export const getStaff = async (req, res) => ok(res, await store(req).get('staff', req.params.phcId));
export const updateStaff = async (req, res) => {
  const d = staffSchema.parse(req.body); const phcId = req.params.phcId;
  await requirePHC(req, phcId);
  ok(res, await store(req).put('staff', phcId, { phcId,
    doctors: { total: d.doctorsTotal, present: d.doctorsPresent },
    nurses: { total: d.nursesTotal, present: d.nursesPresent } }));
};
