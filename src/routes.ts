import { checkHandler } from './app/handlers/checkHandler';
import { sampleHandler } from './app/handlers/sampleHandler';
import { tokenHandler } from './app/handlers/tokenHandler';
import { userHandler } from './app/handlers/userHandler';

// Define a type for handler functions (you can refine this as needed)
type RouteHandler = (...args: any[]) => any;

// Routes mapping
const routes: Record<string, RouteHandler> = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

export default routes;
