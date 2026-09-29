import { z } from 'zod';
export const id = z.string().min(1).max(256).regex(/^[A-Za-z0-9_-]+$/, 'Invalid document ID');
const text = z.string().trim().min(1).max(200);
const count = z.number().int().nonnegative().max(1000000000);
export const phcSchema = z.object({
  name: text, district: text, state: text,
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null)
}).strict();
export const inventorySchema = z.object({
  phcId: id, medicine: text, quantity: count,
  minimumStock: count.default(0), dailyUsage: z.number().nonnegative().max(1000000000).default(0)
}).strict();
export const bedSchema = z.object({ totalBeds: count, occupiedBeds: count }).strict()
  .refine(v => v.occupiedBeds <= v.totalBeds, 'Occupied beds cannot exceed total beds');
export const staffSchema = z.object({
  doctorsTotal: count, doctorsPresent: count, nursesTotal: count, nursesPresent: count
}).strict().refine(v => v.doctorsPresent <= v.doctorsTotal && v.nursesPresent <= v.nursesTotal,
  'Present staff cannot exceed total staff');
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v =>
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Invalid calendar date');
export const footfallSchema = z.object({ phcId: id, date: dateSchema, patients: count }).strict();
export const alertSchema = z.object({
  phcId: id, type: text, severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  message: z.string().trim().min(1).max(2000), medicine: text.nullable().default(null)
}).strict();
export const transferSchema = z.object({
  fromPhcId: id, toPhcId: id, medicine: text, quantity: count.refine(v => v > 0)
}).strict().refine(v => v.fromPhcId !== v.toPhcId, 'Source and destination must differ');
export const transferStatus = z.enum(['PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']);
export const aiSchema = z.object({
  phcId: id, medicine: text, currentStock: count,
  dailyUsage: z.number().nonnegative().max(1000000000), patientFootfall: count.default(0)
}).strict();
export const parseStatus = body => z.object({ status: transferStatus }).strict().parse(body).status;
export const querySchema = z.object({
  phcId: id.optional(), status: z.string().min(1).max(30).optional(),
  date: dateSchema.optional()
}).strict();
