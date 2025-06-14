// Define the structure of the Twilio configuration
export interface TwilioConfig {
  fromPhone: string;
  accountSid: string;
  authToken: string;
}

// Define the structure of each environment
export interface EnvironmentConfig {
  port: number;
  envName: string;
  secretKey: string;
  maxChecks: number;
  twilio: TwilioConfig;
}

// All environments
const environments: Record<string, EnvironmentConfig> = {
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

const currentEnv = process.env.NODE_ENV || 'staging';
const environment = environments[currentEnv] || environments.staging;

export default environment;
