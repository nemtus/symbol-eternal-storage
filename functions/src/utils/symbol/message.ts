import { PublicAccount, Account, EncryptedMessage } from 'symbol-sdk';
import { networkType } from './network';

export const createEncryptedMessageString = (
  message: string,
  publicKeyString: string,
  privateKeyString: string,
): string => {
  const publicAccount = PublicAccount.createFromPublicKey(publicKeyString, networkType);
  const privateKey = Account.createFromPrivateKey(privateKeyString, networkType).privateKey;
  return EncryptedMessage.create(message, publicAccount, privateKey).payload;
};

export const decryptEncryptedMessageString = (
  encryptedMessageString: string,
  publicKeyString: string,
  privateKeyString: string,
  recipientPublicKeyString: string | undefined,
): string => {
  const publicAccount = PublicAccount.createFromPublicKey(publicKeyString, networkType);
  const privateKey = Account.createFromPrivateKey(privateKeyString, networkType).privateKey;
  const recipientPublicAccount = recipientPublicKeyString
    ? PublicAccount.createFromPublicKey(recipientPublicKeyString, networkType)
    : undefined;
  const encryptedMessage = new EncryptedMessage(encryptedMessageString, recipientPublicAccount);
  return EncryptedMessage.decrypt(encryptedMessage, privateKey, publicAccount).payload;
};
