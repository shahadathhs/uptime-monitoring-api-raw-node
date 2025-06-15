import utilities from '../helpers/utilities';
import data from '../lib/data';

type RequestProperties = Record<string, any>;
type HandlerCallback = (
  statusCode: number,
  payload: Record<string, any>,
) => void;

type TokenMethods = 'get' | 'post' | 'put' | 'delete';
type TokenMethodHandler = (
  requestProperties: RequestProperties,
  callback: HandlerCallback,
) => void;

type TokenHandlers = {
  [key in TokenMethods]: TokenMethodHandler;
};

const _token: TokenHandlers = {
  post: (requestProperties, callback) => {
    const phone =
      typeof requestProperties.body?.phone === 'string' &&
      requestProperties.body.phone.trim().length === 11
        ? requestProperties.body.phone.trim()
        : false;

    const password =
      typeof requestProperties.body?.password === 'string' &&
      requestProperties.body.password.trim().length > 0
        ? requestProperties.body.password
        : false;

    if (phone && password) {
      data.read('users', phone, (err, userData) => {
        if (err || !userData) {
          return callback(400, { error: 'User not found' });
        }

        const parsedUser = utilities.parseJSON(userData);
        const hashedPassword = utilities.hash(password);

        if (hashedPassword === parsedUser.password) {
          const tokenId = utilities.createRandomString(20);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObject = { phone, id: tokenId, expires };

          data.create('tokens', tokenId, tokenObject, (err2) => {
            if (!err2) {
              callback(200, tokenObject);
            } else {
              callback(500, { error: 'Could not create token' });
            }
          });
        } else {
          callback(400, { error: 'Invalid password' });
        }
      });
    } else {
      callback(400, { error: 'Invalid phone or password' });
    }
  },

  get: (requestProperties, callback) => {
    const id =
      typeof requestProperties.queryStringObject?.id === 'string' &&
      requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id.trim()
        : false;

    if (id) {
      data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          const token = utilities.parseJSON(tokenData);
          callback(200, token);
        } else {
          callback(404, { error: 'Token not found' });
        }
      });
    } else {
      callback(400, { error: 'Invalid token ID' });
    }
  },

  put: (requestProperties, callback) => {
    const id =
      typeof requestProperties.body?.id === 'string' &&
      requestProperties.body.id.trim().length === 20
        ? requestProperties.body.id.trim()
        : false;

    const extend = requestProperties.body?.extend === true;

    if (id && extend) {
      data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          const tokenObject = utilities.parseJSON(tokenData);

          if (tokenObject.expires > Date.now()) {
            tokenObject.expires = Date.now() + 60 * 60 * 1000;

            data.update('tokens', id, tokenObject, (err2) => {
              if (!err2) {
                callback(200, { message: 'Token extended successfully' });
              } else {
                callback(500, { error: 'Failed to update token' });
              }
            });
          } else {
            callback(400, { error: 'Token already expired' });
          }
        } else {
          callback(400, { error: 'Token not found' });
        }
      });
    } else {
      callback(400, { error: 'Invalid request data' });
    }
  },

  delete: (requestProperties, callback) => {
    const id =
      typeof requestProperties.queryStringObject?.id === 'string' &&
      requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id.trim()
        : false;

    if (id) {
      data.read('tokens', id, (err1, tokenData) => {
        if (!err1 && tokenData) {
          data.delete('tokens', id, (err2) => {
            if (!err2) {
              callback(200, { message: 'Token deleted successfully' });
            } else {
              callback(500, { error: 'Failed to delete token' });
            }
          });
        } else {
          callback(404, { error: 'Token not found' });
        }
      });
    } else {
      callback(400, { error: 'Invalid token ID' });
    }
  },
};

const verifyToken = (
  id: string,
  phone: string,
  callback: (isValid: boolean) => void,
) => {
  data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      const token = utilities.parseJSON(tokenData);
      if (token.phone === phone && token.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

const tokenHandler = {
  handler: (
    requestProperties: RequestProperties,
    callback: HandlerCallback,
  ) => {
    const method = requestProperties.method?.toLowerCase?.();
    if (['get', 'post', 'put', 'delete'].includes(method)) {
      _token[method as TokenMethods](requestProperties, callback);
    } else {
      callback(405, { error: 'Method not allowed' });
    }
  },
  
  _token,
  
  verify: verifyToken,
};

export default tokenHandler;
