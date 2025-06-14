import http, { IncomingMessage, ServerResponse } from 'http';
import { handleReqRes } from '../helpers/handleReqRes';

interface ServerConfig {
  port: number;
}

interface Server {
  config: ServerConfig;
  createServer: () => void;
  handleReqRes: (req: IncomingMessage, res: ServerResponse) => void;
  init: () => void;
}

const server: Server = {
  config: {
    port: 3000,
  },

  createServer() {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
      console.log(`Server listening to port ${server.config.port}`);
    });
  },

  handleReqRes: handleReqRes,

  init() {
    server.createServer();
  },
};

export default server;
