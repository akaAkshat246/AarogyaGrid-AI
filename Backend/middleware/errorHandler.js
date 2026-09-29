import { ZodError } from 'zod';
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) return res.status(400).json({
    success: false, message: 'Invalid request',
    errors: error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
  });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  if (error.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Request body exceeds 100 KB' });
  const status = error instanceof HttpError ? error.status : 500;
  if (status === 500) console.error('Request failed:', error.message);
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : error.message });
}
