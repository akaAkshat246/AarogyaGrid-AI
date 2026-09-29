import { phcSchema } from '../services/validation.js';
import { store, ok } from './helpers.js';
export const getAllPHCs = async (req, res) => ok(res, await store(req).list('phcs'));
export const getPHCById = async (req, res) => ok(res, await store(req).get('phcs', req.params.id));
export const createPHC = async (req, res) => ok(res, await store(req).create('phcs', phcSchema.parse(req.body)), 201);
export const updatePHC = async (req, res) => {
  const patch = phcSchema.partial().parse(req.body);
  for (const key of Object.keys(patch)) if (!Object.hasOwn(req.body, key)) delete patch[key];
  ok(res, await store(req).mutate('phcs', req.params.id, old => ({ ...old, ...patch })));
};
// Related historical records remain; there is intentionally no cascading deletion.
export const deletePHC = async (req, res) => {
  await store(req).remove('phcs', req.params.id); ok(res, { deleted: true });
};
