import { checkHandler } from './app/handlers/checkHandler';
import tokenHandler from './app/handlers/tokenHandler';
import { userHandler } from './app/handlers/userHandler';

// Define a type for handler functions (you can refine this as needed)
type RouteHandler = (...args: any[]) => any;

// Routes mapping
const routes: Record<string, RouteHandler> = {
  user: userHandler,
  token: tokenHandler.handler,
  check: checkHandler,
};

export default routes;
