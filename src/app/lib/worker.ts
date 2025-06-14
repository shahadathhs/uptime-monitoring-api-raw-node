import http, { IncomingMessage, RequestOptions } from 'http';
import https from 'https';
import url from 'url';
import notifications from '../helpers/notifications';
import utilities from '../helpers/utilities';
import data from './data';

// Types
interface CheckData {
  id: string;
  userPhone: string;
  protocol: 'http' | 'https';
  url: string;
  method: string;
  successCodes: number[];
  timeoutSeconds: number;
  state?: 'up' | 'down';
  lastChecked?: number | false;
}

interface CheckOutcome {
  error: boolean;
  responseCode?: number;
  value?: unknown;
}

const worker = {
  // Lookup all the checks
  gatherAllChecks(): void {
    data.list('checks', (err1: string | false, checks?: string[]) => {
      if (!err1 && checks && checks.length > 0) {
        checks.forEach((check) => {
          data.read(
            'checks',
            check,
            (err2: string | false, originalCheckData?: string) => {
              if (!err2 && originalCheckData) {
                worker.validateCheckData(
                  utilities.parseJSON(originalCheckData),
                );
              } else {
                console.log('Error: reading one of the checks data!');
              }
            },
          );
        });
      } else {
        console.log('Error: could not find any checks to process!');
      }
    });
  },

  // Validate individual check data
  validateCheckData(originalCheckData: any): void {
    const data = originalCheckData as CheckData;
    if (data && data.id) {
      data.state =
        typeof data.state === 'string' && ['up', 'down'].includes(data.state)
          ? data.state
          : 'down';

      data.lastChecked =
        typeof data.lastChecked === 'number' && data.lastChecked > 0
          ? data.lastChecked
          : false;

      worker.performCheck(data);
    } else {
      console.log('Error: check was invalid or not properly formatted!');
    }
  },

  // Perform check
  performCheck(checkData: CheckData): void {
    let checkOutCome: CheckOutcome = {
      error: false,
      responseCode: undefined,
    };
    let outcomeSent = false;

    const parsedUrl = url.parse(
      `${checkData.protocol}://${checkData.url}`,
      true,
    );
    const hostName = parsedUrl.hostname || '';
    const path = parsedUrl.path || '/';

    const requestDetails: RequestOptions = {
      protocol: `${checkData.protocol}:`,
      hostname: hostName,
      method: checkData.method.toUpperCase(),
      path,
      timeout: checkData.timeoutSeconds * 1000,
    };

    const protocolToUse = checkData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(
      requestDetails,
      (res: IncomingMessage) => {
        const status = res.statusCode || 0;
        checkOutCome.responseCode = status;

        if (!outcomeSent) {
          worker.processCheckOutcome(checkData, checkOutCome);
          outcomeSent = true;
        }
      },
    );

    req.on('error', (e) => {
      checkOutCome = {
        error: true,
        value: e,
      };
      if (!outcomeSent) {
        worker.processCheckOutcome(checkData, checkOutCome);
        outcomeSent = true;
      }
    });

    req.on('timeout', () => {
      checkOutCome = {
        error: true,
        value: 'timeout',
      };
      if (!outcomeSent) {
        worker.processCheckOutcome(checkData, checkOutCome);
        outcomeSent = true;
      }
    });

    req.end();
  },

  // Process check outcome
  processCheckOutcome(checkData: CheckData, outcome: CheckOutcome): void {
    const state =
      !outcome.error &&
      outcome.responseCode &&
      checkData.successCodes.includes(outcome.responseCode)
        ? 'up'
        : 'down';

    const alertWanted = !!(checkData.lastChecked && checkData.state !== state);

    const newCheckData = { ...checkData, state, lastChecked: Date.now() };

    data.update(
      'checks',
      newCheckData.id,
      newCheckData,
      (err: string | false) => {
        if (!err) {
          if (alertWanted) {
            worker.alertUserToStatusChange(newCheckData);
          } else {
            console.log('Alert is not needed as there is no state change!');
          }
        } else {
          console.log('Error trying to save check data of one of the checks!');
        }
      },
    );
  },

  // Alert user to status change
  alertUserToStatusChange(newCheckData: CheckData): void {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    notifications.sendTwilioSms(
      newCheckData.userPhone,
      msg,
      (err: string | false) => {
        if (!err) {
          console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
          console.log('There was a problem sending SMS to one of the users!');
        }
      },
    );
  },

  // Loop to run every minute
  loop(): void {
    setInterval(() => {
      worker.gatherAllChecks();
    }, 1000 * 60);
  },

  // Init
  init(): void {
    worker.gatherAllChecks();
    worker.loop();
  },
};

export default worker;
