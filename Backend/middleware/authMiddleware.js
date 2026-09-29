import { HttpError } from './errorHandler.js';
export function verifyUser({ auth, skipAuth }) {
  return async (req, res, next) => {
    if (skipAuth) { req.user = { uid: 'local-demo' }; return next(); }
    const match = /^Bearer (\S+)$/i.exec(req.headers.authorization ?? '');
    if (!match) throw new HttpError(401, 'A Firebase ID token is required');
    try { req.user = await auth.verifyIdToken(match[1], true); }
    catch { throw new HttpError(401, 'Invalid or expired Firebase ID token'); }
    next();
  };
}
