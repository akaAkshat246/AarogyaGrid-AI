import { inventorySchema } from '../services/validation.js';
import { store, ok, requirePHC } from './helpers.js';
export const getInventory = async (req, res) => {
  await requirePHC(req, req.params.phcId);
  ok(res, await store(req).list('inventory', { phcId: req.params.phcId }));
};
export const addInventoryItem = async (req, res) => {
  const data = inventorySchema.parse(req.body); await requirePHC(req, data.phcId);
  ok(res, await store(req).create('inventory', data), 201);
};
export const updateInventoryItem = async (req, res) => {
  const patch = inventorySchema.omit({ phcId: true }).partial().parse(req.body);
  for (const key of Object.keys(patch)) if (!Object.hasOwn(req.body, key)) delete patch[key];
  ok(res, await store(req).mutate('inventory', req.params.id, old => ({ ...old, ...patch })));
};
export const deleteInventoryItem = async (req, res) => {
  await store(req).remove('inventory', req.params.id); ok(res, { deleted: true });
};
