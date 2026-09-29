import { transferSchema, parseStatus, querySchema } from '../services/validation.js';
import { HttpError } from '../middleware/errorHandler.js';
import { store, ok, requirePHC } from './helpers.js';
const transitions = {
  PENDING: ['APPROVED', 'CANCELLED'], APPROVED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: []
};
export const getTransfers = async (req, res) => {
  const q = querySchema.pick({ phcId: true, status: true }).parse(req.query);
  const rows = await store(req).list('transfers');
  ok(res, rows.filter(v => (!q.status || v.status === q.status) &&
    (!q.phcId || v.fromPhcId === q.phcId || v.toPhcId === q.phcId)));
};
export const createTransfer = async (req, res) => {
  const data = transferSchema.parse(req.body);
  await Promise.all([requirePHC(req, data.fromPhcId), requirePHC(req, data.toPhcId)]);
  ok(res, await store(req).create('transfers', { ...data, status: 'PENDING' }), 201);
};
export const updateTransferStatus = async (req, res) => {
  const status = parseStatus(req.body);
  ok(res, await store(req).mutate('transfers', req.params.id, old => {
    if (old.status !== status && !transitions[old.status]?.includes(status)) {
      throw new HttpError(409, 'Invalid transfer transition: ' + old.status + ' -> ' + status);
    }
    return { ...old, status };
  }));
};
