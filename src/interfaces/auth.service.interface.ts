export interface LoginResult {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface IAuthService {
  /** Verifies Basic credentials and issues a short-lived JWT. Throws UnauthorizedError on failure. */
  login(username: string, password: string): Promise<LoginResult>;
}
