import type { Middleware } from '../interfaces/middleware.interface.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/** Requires the authenticated user to have one of the given roles. Place after authMiddleware. */
export const requireRole =
  (...roles: string[]): Middleware =>
  (next) =>
  async (event) => {
    if (!event.user) throw new UnauthorizedError();
    if (!roles.some((r) => event.user?.roles.includes(r))) throw new ForbiddenError();
    return next(event);
  };
