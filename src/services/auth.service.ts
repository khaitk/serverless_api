import { createHash, timingSafeEqual } from 'node:crypto';
import { SignJWT } from 'jose';
import type { IAuthService, LoginResult } from '../interfaces/auth.service.interface.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

const digest = (value: string) => createHash('sha256').update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export class AuthService implements IAuthService {
  async login(username: string, password: string): Promise<LoginResult> {
    // Evaluate both comparisons so timing doesn't reveal which one failed.
    const userOk = safeEqual(username, env.basicAuthUser);
    const passOk = safeEqual(password, env.basicAuthPassword);
    if (!userOk || !passOk) throw new UnauthorizedError('Invalid username or password');

    const token = await new SignJWT({ roles: ['admin'] })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(username)
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
      .sign(new TextEncoder().encode(env.jwtSecret));

    return { token, tokenType: 'Bearer', expiresIn: TOKEN_TTL_SECONDS };
  }
}
