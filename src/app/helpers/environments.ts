// Define the structure of the Twilio configuration
interface TwilioConfig {
  fromPhone: string;
  accountSid: string;
  authToken: string;
}

// Define the structure of each environment
interface Environment {
  port: number;
  envName: string;
  secretKey: string;
  maxChecks: number;
  twilio: TwilioConfig;
}

// All environments
const environments: Record<string, Environment> = {
  staging: {
    port: 3000,
    envName: 'staging',
    secretKey: 'secretKey',
    maxChecks: 5,
    twilio: {
      fromPhone: '',
      accountSid: '',
      authToken: '',
    },
  },

  production: {
    port: 5000,
    envName: 'production',
    secretKey: 'secretKey',
    maxChecks: 5,
    twilio: {
      fromPhone: '',
      accountSid: '',
      authToken: '',
    },
  },
};

// Determine which environment to export
const currentEnvironment: string =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport: Environment =
  environments[currentEnvironment] ?? environments.staging;

export default environmentToExport;
