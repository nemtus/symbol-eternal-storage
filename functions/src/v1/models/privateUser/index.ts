import { AdminUser } from '../adminUser';

export interface PrivateUser {
  userId: string;
  userDisplayName: string;
  userPhotoUrl: string;
  userSaltBase64String: string;
  userIvHexString: string;
  userServiceFeePayerAccountPublicKeyString: string;
  userServiceFeePayerAccountAddressString: string;
  userServiceStorageAccountPublicKeyString: string;
  userServiceStorageAccountAddressString: string;
  userMultisigAccountModified: boolean;
  userAccountRestricted: boolean;
  userAccountPrepared: boolean;
  userMultisigAccountPrivateKeyEncryptedString: string;
  userMultisigAccountPublicKeyString: string;
  userMultisigAccountAddressString: string;
  userCosigner1AccountPublicKeyString: string;
  userCosigner1AccountAddressString: string;
  userCosigner2AccountPublicKeyString: string;
  userCosigner2AccountAddressString: string;
  userCosigner3AccountPublicKeyString: string;
  userCosigner3AccountAddressString: string;
  userCreatedAt: Date;
  userUpdatedAt: Date;
}

export const convertAdminUserToPrivateUser = (adminUser: AdminUser): PrivateUser => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userCosigner1AccountPrivateKeyEncryptedString,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userCosigner2AccountPrivateKeyEncryptedString,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userCosigner3AccountPrivateKeyEncryptedString,
    ...privateUser
  } = adminUser;
  return privateUser;
};
