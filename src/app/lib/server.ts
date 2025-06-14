import http, { IncomingMessage, ServerResponse } from 'http';
import reqResHandler from '../handlers/reqResHandler';

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

  handleReqRes: reqResHandler.handler,

  init() {
    server.createServer();
  },
};

export default server;
