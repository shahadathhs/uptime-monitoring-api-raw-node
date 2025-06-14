import https from 'https';
import querystring from 'querystring';
import environment from './environments';

// Define the callback type
type Callback = (error: string | false) => void;

// Define the notifications object
const notifications = {
  // Send SMS to user using Twilio API
  sendTwilioSms: (phone: string, msg: string, callback: Callback): void => {
    // Input validation
    const userPhone =
      typeof phone === 'string' && phone.trim().length === 11
        ? phone.trim()
        : false;

    const userMsg =
      typeof msg === 'string' &&
      msg.trim().length > 0 &&
      msg.trim().length <= 1600
        ? msg.trim()
        : false;

    if (userPhone && userMsg) {
      // Configure the request payload
      const payload = {
        From: environment.twilio.fromPhone,
        To: `+88${userPhone}`,
        Body: userMsg,
      };

      const stringifyPayload = querystring.stringify(payload);

      // Configure the request details
      const requestDetails = {
        hostname: 'api.twilio.com',
        method: 'POST',
        path: `/2010-04-01/Accounts/${environment.twilio.accountSid}/Messages.json`,
        auth: `${environment.twilio.accountSid}:${environment.twilio.authToken}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const req = https.request(requestDetails, (res) => {
        const status = res.statusCode || 500;
        if (status === 200 || status === 201) {
          callback(false);
        } else {
          callback(`Status code returned was ${status}`);
        }
      });

      req.on('error', (e: Error) => {
        callback(e.message);
      });

      req.write(stringifyPayload);
      req.end();
    } else {
      callback('Given parameters were missing or invalid!');
    }
  },
};

export default notifications;
