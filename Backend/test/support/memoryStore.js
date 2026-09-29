import { randomUUID } from 'node:crypto';
import { HttpError } from '../../middleware/errorHandler.js';
import { id as idSchema } from '../../services/validation.js';
// Test double only. Runtime always uses Firestore.
export function memoryStore() {
  const tables = new Map();
  const table = name => { if (!tables.has(name)) tables.set(name, new Map()); return tables.get(name); };
  return {
    async list(name, filters = {}) { return [...table(name).values()].filter(v =>
      Object.entries(filters).every(([k, value]) => value === undefined || v[k] === value)).map(v => structuredClone(v)); },
    async get(name, id) {
      idSchema.parse(id);
      if (!table(name).has(id)) throw new HttpError(404, 'Record not found');
      return structuredClone(table(name).get(id));
    },
    async create(name, data) { const id = randomUUID(); return this.put(name, id, data); },
    async put(name, id, data) {
      idSchema.parse(id);
      const value = { ...data, id, createdAt: table(name).get(id)?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() };
      table(name).set(id, structuredClone(value)); return value;
    },
    async mutate(name, id, transform) { return this.put(name, id, await transform(await this.get(name, id))); },
    async remove(name, id) { await this.get(name, id); table(name).delete(id); },
    async ping() {}
  };
}
