import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { ZodType, ZodTypeDef } from 'zod';
import { ValidationError } from './errors.js';

const headers = { 'Content-Type': 'application/json' };

export const ok = (body: unknown, statusCode = 200): APIGatewayProxyResult => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

export const noContent = (): APIGatewayProxyResult => ({ statusCode: 204, headers, body: '' });

export function parseBody<T>(event: APIGatewayProxyEvent, schema: ZodType<T, ZodTypeDef, unknown>): T {
  let raw: unknown;
  try {
    raw = event.body ? JSON.parse(event.body) : {};
  } catch {
    throw new ValidationError('Body must be valid JSON');
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  return result.data;
}

export function pathParam(event: APIGatewayProxyEvent, name: string): string {
  const value = event.pathParameters?.[name];
  if (!value) throw new ValidationError(`Missing path parameter: ${name}`);
  return value;
}
