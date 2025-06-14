import server from './app/lib/server';
import worker from './app/lib/worker';

// App object - module scaffolding
const app = {
  init(): void {
    // Start the server
    server.init();

    // Start the workers
    worker.init();
  },
};

// Initialize the app
app.init();

// Export the app (if needed elsewhere)
export default app;
