import type { Handler, Middleware } from '../interfaces/middleware.interface.js';
import { authMiddleware } from './auth.middleware.js';
import { errorMiddleware } from './error.middleware.js';

export { authMiddleware, errorMiddleware };
export { requireRole } from './role.middleware.js';

/** Applies middlewares left-to-right: the first one is the outermost. */
export const withMiddlewares = (handler: Handler, ...middlewares: Middleware[]): Handler =>
  middlewares.reduceRight((next, mw) => mw(next), handler);

/** Standard stack for protected routes: error formatting, then authentication. */
export const protectedRoute = (handler: Handler, ...extra: Middleware[]): Handler =>
  withMiddlewares(handler, errorMiddleware, authMiddleware, ...extra);

/** Stack for public routes (e.g. health, login). */
export const publicRoute = (handler: Handler): Handler => withMiddlewares(handler, errorMiddleware);
