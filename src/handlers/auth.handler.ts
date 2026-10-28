import { authController } from '../container.js';
import { publicRoute } from '../middlewares/index.js';

export const login = publicRoute(authController.login);
