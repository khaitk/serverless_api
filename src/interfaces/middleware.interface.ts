import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface AuthUser {
  id: string;
  roles: string[];
}

/** Event enriched by middlewares (e.g. `user` is set by the auth middleware). */
export interface AppEvent extends APIGatewayProxyEvent {
  user?: AuthUser;
}

export type Handler = (event: AppEvent) => Promise<APIGatewayProxyResult>;

/** A middleware wraps the next handler and may short-circuit or enrich the event. */
export type Middleware = (next: Handler) => Handler;
