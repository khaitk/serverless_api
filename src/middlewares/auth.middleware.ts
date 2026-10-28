import { jwtVerify } from 'jose';
import type { AuthUser, Middleware } from '../interfaces/middleware.interface.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

const secret = () => new TextEncoder().encode(env.jwtSecret);

/** Verifies the `Authorization: Bearer <jwt>` header and sets `event.user`. */
export const authMiddleware: Middleware = (next) => async (event) => {
  const header = event.headers['Authorization'] ?? event.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) throw new UnauthorizedError('Missing bearer token');

  let user: AuthUser;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    if (!payload.sub) throw new Error('Missing subject');
    const roles = Array.isArray(payload['roles']) ? (payload['roles'] as string[]) : [];
    user = { id: payload.sub, roles };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
  return next({ ...event, user });
};
