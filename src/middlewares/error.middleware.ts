import type { Middleware } from '../interfaces/middleware.interface.js';
import { AppError } from '../utils/errors.js';
import { ok } from '../utils/http.js';

/** Converts thrown errors into HTTP responses. Must be the outermost middleware. */
export const errorMiddleware: Middleware = (next) => async (event) => {
  try {
    return await next(event);
  } catch (err) {
    if (err instanceof AppError) {
      return ok({ error: { code: err.code, message: err.message } }, err.statusCode);
    }
    console.error('Unhandled error', err);
    return ok({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500);
  }
};
