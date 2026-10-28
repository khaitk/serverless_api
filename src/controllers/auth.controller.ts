import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { IAuthService } from '../interfaces/auth.service.interface.js';
import { UnauthorizedError } from '../utils/errors.js';
import { ok } from '../utils/http.js';

export class AuthController {
  constructor(private readonly service: IAuthService) {}

  /** POST /auth/login with `Authorization: Basic base64(user:pass)`. */
  login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { username, password } = parseBasicAuth(event);
    return ok(await this.service.login(username, password));
  };
}

function parseBasicAuth(event: APIGatewayProxyEvent): { username: string; password: string } {
  const header = event.headers['Authorization'] ?? event.headers['authorization'];
  if (!header?.startsWith('Basic ')) throw new UnauthorizedError('Basic credentials required');

  const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator < 0) throw new UnauthorizedError('Malformed Basic credentials');

  return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}
