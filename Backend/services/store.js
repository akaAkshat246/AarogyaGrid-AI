import { HttpError } from '../middleware/errorHandler.js';
import { id as idSchema } from './validation.js';
const stamp = () => new Date().toISOString();
// ISO UTC timestamps keep the JSON representation consistent for frontend clients.
export function createStore(db) {
  const ref = (collection, id) => db.collection(collection).doc(idSchema.parse(id));
  return {
    async list(collection, filters = {}) {
      let query = db.collection(collection);
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) query = query.where(key, '==', value);
      }
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    },
    async get(collection, id) {
      const doc = await ref(collection, id).get();
      if (!doc.exists) throw new HttpError(404, collection + ' record not found');
      return { ...doc.data(), id: doc.id };
    },
    async create(collection, data) {
      const doc = db.collection(collection).doc();
      const value = { ...data, createdAt: stamp(), updatedAt: stamp() };
      await doc.create(value);
      return { ...value, id: doc.id };
    },
    async put(collection, id, data) {
      const doc = ref(collection, id);
      return db.runTransaction(async tx => {
        const old = await tx.get(doc);
        const value = { ...data, createdAt: old.data()?.createdAt ?? stamp(), updatedAt: stamp() };
        tx.set(doc, value);
        return { ...value, id };
      });
    },
    async mutate(collection, id, transform) {
      const doc = ref(collection, id);
      return db.runTransaction(async tx => {
        const old = await tx.get(doc);
        if (!old.exists) throw new HttpError(404, collection + ' record not found');
        const value = { ...await transform(old.data()), updatedAt: stamp() };
        tx.set(doc, value);
        return { ...value, id };
      });
    },
    async remove(collection, id) {
      const doc = ref(collection, id);
      await db.runTransaction(async tx => {
        if (!(await tx.get(doc)).exists) throw new HttpError(404, collection + ' record not found');
        tx.delete(doc);
      });
    },
    async ping() { await db.collection('phcs').limit(1).get(); }
  };
}
