import * as crypto from 'crypto';

export const encrypt = (plainMessage: string, password: string, salt: string, ivHexString: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, salt, 32);
  const iv = convertHexStringToBuffer(ivHexString);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let cipherData = cipher.update(plainMessage, 'utf8', 'hex');
  cipherData += cipher.final('hex');
  return cipherData;
};

export const decrypt = (encryptedMessage: string, password: string, salt: string, ivHexString: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, salt, 32);
  const iv = convertHexStringToBuffer(ivHexString);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decipherData = decipher.update(encryptedMessage, 'hex', 'utf-8');
  decipherData += decipher.final('utf-8');
  return decipherData;
};

export const createSaltHexString = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const createIvHexString = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const convertHexStringToBuffer = (hexString: string): Buffer => {
  return Buffer.from(hexString, 'hex');
};
