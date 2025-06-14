import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';
import { StringDecoder } from 'string_decoder';
import { parse } from 'url';
import routes from '../../routes';
import { notFoundHandler } from '../handlers/notFoundHandler';
import { parseJSON } from './utilities';

// Define request properties interface
interface RequestProperties {
  parsedUrl: ReturnType<typeof parse>;
  path: string;
  trimmedPath: string;
  method: string;
  queryStringObject: { [key: string]: any };
  headersObject: IncomingHttpHeaders;
  body?: any;
}

// Define the handler function type
type HandlerFunction = (
  reqProps: RequestProperties,
  callback: (statusCode: number, payload: object) => void,
) => void;

// module scaffolding
const handler = {
  handleReqRes: (req: IncomingMessage, res: ServerResponse): void => {
    // parse URL
    const parsedUrl = parse(req.url || '', true);
    const path = parsedUrl.pathname || '/';
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = (req.method || 'GET').toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties: RequestProperties = {
      parsedUrl,
      path,
      trimmedPath,
      method,
      queryStringObject,
      headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler: HandlerFunction =
      typeof routes[trimmedPath] === 'function'
        ? routes[trimmedPath]
        : notFoundHandler;

    req.on('data', (buffer) => {
      realData += decoder.write(buffer);
    });

    req.on('end', () => {
      realData += decoder.end();

      requestProperties.body = parseJSON(realData);

      chosenHandler(requestProperties, (statusCode, payload) => {
        const finalStatusCode =
          typeof statusCode === 'number' ? statusCode : 500;
        const finalPayload = typeof payload === 'object' ? payload : {};

        const payloadString = JSON.stringify(finalPayload);

        // Set response headers and send
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(finalStatusCode);
        res.end(payloadString);
      });
    });
  },
};

export default handler;
