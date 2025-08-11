import crypto from 'crypto';

export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};