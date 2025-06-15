import utilities from '../helpers/utilities';
import data from '../lib/data';
import tokenHandler from './tokenHandler';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface RequestProperties {
  method: HttpMethod;
  body: Record<string, any>;
  queryStringObject: Record<string, any>;
  headersObject: Record<string, any>;
}

type CallbackType = (statusCode: number, payload?: Record<string, any>) => void;

// module scaffolding
const userHandler = {
  handler(req: RequestProperties, cb: CallbackType) {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.includes(req.method)) {
      userHandler._users[req.method](req, cb);
    } else {
      cb(405);
    }
  },

  _users: {
    post(req: RequestProperties, cb: CallbackType) {
      const { firstName, lastName, phone, password, tosAgreement } = req.body;

      const validFirstName =
        typeof firstName === 'string' && firstName.trim().length > 0
          ? firstName
          : false;
      const validLastName =
        typeof lastName === 'string' && lastName.trim().length > 0
          ? lastName
          : false;
      const validPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone : false;
      const validPassword =
        typeof password === 'string' && password.trim().length > 0
          ? password
          : false;
      const validTosAgreement =
        typeof tosAgreement === 'boolean' && tosAgreement
          ? tosAgreement
          : false;

      if (
        validFirstName &&
        validLastName &&
        validPhone &&
        validPassword &&
        validTosAgreement
      ) {
        data.read('users', validPhone, (err1: Error | boolean) => {
          if (err1) {
            const userObject = {
              firstName: validFirstName,
              lastName: validLastName,
              phone: validPhone,
              password: utilities.hash(validPassword),
              tosAgreement: validTosAgreement,
            };

            data.create(
              'users',
              validPhone,
              userObject,
              (err2: Error | boolean) => {
                if (!err2)
                  cb(200, { message: 'User was created successfully!' });
                else cb(500, { error: 'Could not create user!' });
              },
            );
          } else {
            cb(500, { error: 'There was a problem in server side!' });
          }
        });
      } else {
        cb(400, { error: 'You have a problem in your request' });
      }
    },

    get(req: RequestProperties, cb: CallbackType) {
      const phone =
        typeof req.queryStringObject.phone === 'string' &&
        req.queryStringObject.phone.trim().length === 11
          ? req.queryStringObject.phone
          : false;

      if (phone) {
        const token = req.headersObject.token ?? '';

        tokenHandler.verify(token, phone, (isValid: boolean) => {
          if (isValid) {
            data.read('users', phone, (err: Error | boolean, u: any) => {
              const user = { ...utilities.parseJSON(u) };
              if (!err && user) {
                delete user.password;
                cb(200, user);
              } else {
                cb(404, { error: 'Requested user was not found!' });
              }
            });
          } else {
            cb(403, { error: 'Authentication failure!' });
          }
        });
      } else {
        cb(404, { error: 'Requested user was not found!' });
      }
    },

    put(req: RequestProperties, cb: CallbackType) {
      const { phone, firstName, lastName, password } = req.body;

      const validPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone : false;
      const validFirstName =
        typeof firstName === 'string' && firstName.trim().length > 0
          ? firstName
          : false;
      const validLastName =
        typeof lastName === 'string' && lastName.trim().length > 0
          ? lastName
          : false;
      const validPassword =
        typeof password === 'string' && password.trim().length > 0
          ? password
          : false;

      if (validPhone) {
        if (validFirstName || validLastName || validPassword) {
          const token = req.headersObject.token ?? '';

          tokenHandler.verify(token, validPhone, (isValid: boolean) => {
            if (isValid) {
              data.read(
                'users',
                validPhone,
                (err: Error | boolean, uData: any) => {
                  const userData = { ...utilities.parseJSON(uData) };
                  if (!err && userData) {
                    if (validFirstName) userData.firstName = validFirstName;
                    if (validLastName) userData.lastName = validLastName;
                    if (validPassword)
                      userData.password = utilities.hash(validPassword);

                    data.update(
                      'users',
                      validPhone,
                      userData,
                      (err2: Error | boolean) => {
                        if (!err2)
                          cb(200, {
                            message: 'User was updated successfully!',
                          });
                        else
                          cb(500, {
                            error: 'There was a problem in the server side!',
                          });
                      },
                    );
                  } else {
                    cb(400, { error: 'You have a problem in your request!' });
                  }
                },
              );
            } else {
              cb(403, { error: 'Authentication failure!' });
            }
          });
        } else {
          cb(400, { error: 'You have a problem in your request!' });
        }
      } else {
        cb(400, { error: 'Invalid phone number. Please try again!' });
      }
    },

    delete(req: RequestProperties, cb: CallbackType) {
      const phone =
        typeof req.queryStringObject.phone === 'string' &&
        req.queryStringObject.phone.trim().length === 11
          ? req.queryStringObject.phone
          : false;

      if (phone) {
        const token = req.headersObject.token ?? '';

        tokenHandler.verify(token, phone, (isValid: boolean) => {
          if (isValid) {
            data.read('users', phone, (err: Error | boolean, userData: any) => {
              if (!err && userData) {
                data.delete('users', phone, (err2: Error | boolean) => {
                  if (!err2)
                    cb(200, { message: 'User was successfully deleted!' });
                  else cb(500, { error: 'There was a server side error!' });
                });
              } else {
                cb(500, { error: 'There was a server side error!' });
              }
            });
          } else {
            cb(403, { error: 'Authentication failure!' });
          }
        });
      } else {
        cb(400, { error: 'There was a problem in your request!' });
      }
    },
  },
};

export default userHandler;
