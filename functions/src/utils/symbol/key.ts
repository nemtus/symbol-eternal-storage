import { randomBytes } from 'crypto';
import { PrivateKey, PublicKey } from '@nemtus/symbol-sdk-typescript/esm/CryptoTypes';
import { KeyPair } from '@nemtus/symbol-sdk-typescript/esm/symbol/KeyPair';
import { SymbolFacade } from '@nemtus/symbol-sdk-typescript/esm/facade/SymbolFacade';

export const createNewPrivateKeyString = (): string => {
  const privateKeyBuffer = randomBytes(32);
  const privateKeyString = privateKeyBuffer.toString('hex').toUpperCase();
  return privateKeyString;
};

export const convertPrivateKeyStringToPublicKeyString = (privateKeyString: string): string => {
  if (!validatePrivateKeyString(privateKeyString)) {
    throw Error('Invalid private key string');
  }
  const privateKeyInstance = new PrivateKey(privateKeyString);
  const keyPairInstance = new KeyPair(privateKeyInstance);
  const publicKeyString = keyPairInstance.publicKey.toString();
  return publicKeyString;
};

export const convertPublicKeyStringToAddressString = (publicKeyString: string, networkName: string): string => {
  if (networkName !== 'testnet' && networkName !== 'mainnet') {
    throw Error('Invalid network name');
  }
  if (!validatePublicKeyString(publicKeyString)) {
    throw Error('Invalid public key string');
  }
  const facade = new SymbolFacade(networkName);
  const publicKey = new PublicKey(publicKeyString);
  const addressString = facade.network.publicKeyToAddress(publicKey).toString();
  return addressString;
};

export const validatePrivateKeyString = (privateKeyString: string): boolean => {
  if (privateKeyString.length !== 64) {
    return false;
  }
  if (!/^[0-9A-F]+$/.test(privateKeyString)) {
    return false;
  }
  return true;
};

export const validatePublicKeyString = (publicKeyString: string): boolean => {
  if (publicKeyString.length !== 64) {
    return false;
  }
  if (!/^[0-9A-F]+$/.test(publicKeyString)) {
    return false;
  }
  return true;
};
