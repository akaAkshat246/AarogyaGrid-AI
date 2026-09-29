import { aiSchema } from '../services/validation.js';
import { store, ok, requirePHC } from './helpers.js';
export const predict = async (req, res) => {
  const input = aiSchema.parse(req.body); await requirePHC(req, input.phcId);
  const result = await req.app.locals.predict(input);
  ok(res, await store(req).create('predictions', { phcId: input.phcId, input, result }), 201);
};
export const getPredictions = async (req, res) => {
  await requirePHC(req, req.params.phcId);
  ok(res, await store(req).list('predictions', { phcId: req.params.phcId }));
};
