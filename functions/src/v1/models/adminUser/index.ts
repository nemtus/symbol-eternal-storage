import { PrivateUser } from '../privateUser';

export interface AdminUser extends PrivateUser {
  userCosigner1AccountPrivateKeyEncryptedString: string;
  userCosigner2AccountPrivateKeyEncryptedString: string;
  userCosigner3AccountPrivateKeyEncryptedString: string;
}
