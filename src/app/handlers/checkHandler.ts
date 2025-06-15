import environment from '../helpers/environments';
import utilities from '../helpers/utilities';
import data from '../lib/data';
import tokenHandler from './tokenHandler';

interface RequestProperties {
  method: string;
  body: Record<string, any>;
  queryStringObject: Record<string, any>;
  headersObject: Record<string, any>;
}

interface CheckObject {
  id: string;
  userPhone: string;
  protocol: string;
  url: string;
  method: string;
  successCodes: number[];
  timeoutSeconds: number;
}

type HandlerCallback = (
  statusCode: number,
  payload?: Record<string, any>,
) => void;
type MethodHandler = (
  requestProperties: RequestProperties,
  callback: HandlerCallback,
) => void;

const checkHandler = {
  handler: (
    requestProperties: RequestProperties,
    callback: HandlerCallback,
  ) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    const method = requestProperties.method?.toLowerCase?.();

    if (acceptedMethods.includes(method)) {
      checkHandler._check[method](requestProperties, callback);
    } else {
      callback(405);
    }
  },

  _check: {
    post: (requestProperties: RequestProperties, callback: HandlerCallback) => {
      const { protocol, url, method, successCodes, timeoutSeconds } =
        requestProperties.body;

      const validProtocol =
        typeof protocol === 'string' && ['http', 'https'].includes(protocol)
          ? protocol
          : false;
      const validUrl =
        typeof url === 'string' && url.trim().length > 0 ? url : false;
      const validMethod =
        typeof method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].includes(method)
          ? method
          : false;
      const validSuccessCodes = Array.isArray(successCodes)
        ? successCodes
        : false;
      const validTimeout =
        typeof timeoutSeconds === 'number' &&
        Number.isInteger(timeoutSeconds) &&
        timeoutSeconds >= 1 &&
        timeoutSeconds <= 5
          ? timeoutSeconds
          : false;

      if (
        validProtocol &&
        validUrl &&
        validMethod &&
        validSuccessCodes &&
        validTimeout
      ) {
        const token = requestProperties.headersObject.token ?? '';

        data.read('tokens', token, (err1, tokenData) => {
          if (!err1 && tokenData) {
            const userPhone = utilities.parseJSON(tokenData).phone;

            data.read('users', userPhone, (err2, userData) => {
              if (!err2 && userData) {
                tokenHandler.verify(
                  token,
                  userPhone,
                  (tokenIsValid: boolean) => {
                    if (tokenIsValid) {
                      const userObject = utilities.parseJSON(userData);
                      const userChecks: string[] = Array.isArray(
                        userObject.checks,
                      )
                        ? userObject.checks
                        : [];

                      if (userChecks.length < environment.maxChecks) {
                        const checkId = utilities.createRandomString(20);
                        const checkObject: CheckObject = {
                          id: checkId,
                          userPhone,
                          protocol: validProtocol,
                          url: validUrl,
                          method: validMethod,
                          successCodes: validSuccessCodes,
                          timeoutSeconds: validTimeout,
                        };

                        data.create('checks', checkId, checkObject, (err3) => {
                          if (!err3) {
                            userObject.checks = userChecks;
                            userObject.checks.push(checkId);

                            data.update(
                              'users',
                              userPhone,
                              userObject,
                              (err4) => {
                                if (!err4) {
                                  callback(200, checkObject);
                                } else {
                                  callback(500, {
                                    error:
                                      'There was a problem in the server side!',
                                  });
                                }
                              },
                            );
                          } else {
                            callback(500, {
                              error: 'There was a problem in the server side!',
                            });
                          }
                        });
                      } else {
                        callback(401, {
                          error: 'User has already reached max check limit!',
                        });
                      }
                    } else {
                      callback(403, { error: 'Authentication problem!' });
                    }
                  },
                );
              } else {
                callback(403, { error: 'User not found!' });
              }
            });
          } else {
            callback(403, { error: 'Authentication problem!' });
          }
        });
      } else {
        callback(400, { error: 'You have a problem in your request' });
      }
    },
  } as Record<string, MethodHandler>,
};

export default checkHandler;
