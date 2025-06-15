import crypto from 'crypto';
import environment from './environments';

const utilities = {
  // * Parse JSON string to Object
  parseJSON: (jsonString: string): Record<string, any> => {
    let output: Record<string, any>;
    
    try {
      output = JSON.parse(jsonString);
    } catch {
      output = {};
    }
    
    return output;
  },

  // * Hash a string using SHA256
  hash: (str: string): string => {
    return crypto
      .createHmac('sha256', environment.secretKey)
      .update(str)
      .digest('hex');
  },

  // * Create a random alphanumeric string of a given length
  createRandomString: (strLength: number = 20): string => {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    
    let output = '';
    
    for (let i = 0; i < length; i++) {
      const randomChar = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length),
      );
      output += randomChar;
    }
    
    return output;
  },
};

export default utilities;
