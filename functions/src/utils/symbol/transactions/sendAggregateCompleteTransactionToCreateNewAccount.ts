import {
  Account,
  PublicAccount,
  UnresolvedAddress,
  Deadline,
  PlainMessage,
  AddressRestrictionFlag,
  TransferTransaction,
  MultisigAccountModificationTransaction,
  AccountAddressRestrictionTransaction,
  AggregateTransaction,
  AggregateTransactionCosignature,
  CosignatureTransaction,
  CosignatureSignedTransaction,
  TransactionMapping,
  RepositoryFactoryHttp,
  TransactionInfo,
} from 'symbol-sdk';
import { AdminUser } from '../../../v1/models/adminUser';
import { AdminUserTransaction } from '../../../v1/models/adminUserTransaction';
import { CreateAndSetUpNewAccountMessage } from '../../../v1/models/message';
import { db } from '../../firebase/firebase';
import { logger } from '../../firebase/logger';
import { epochAdjustment, networkGenerationHash, networkType } from '../network';
import { selectRandomNode } from '../node';

export interface CreateAndSetUpNewAccountInfo {
  userId: string;
  userServiceFeePayerAccountPrivateKeyString: string;
  userServiceStorageAccountPublicKeyString: string;
  userMultisigAccountPrivateKeyString: string;
  userCosigner1AccountPrivateKeyString: string;
  userCosigner2AccountPrivateKeyString: string;
  userCosigner3AccountPrivateKeyString: string;
}

export const sendAggregateCompleteTransactionToCreateAndSetUpNewAccount = async (
  createAndSetUpNewAccountInfo: CreateAndSetUpNewAccountInfo,
) => {
  logger.debug('sendAggregateCompleteTransactionToCreateAndSetUpNewAccount start');

  const userServiceFeePayerAccount = Account.createFromPrivateKey(
    createAndSetUpNewAccountInfo.userServiceFeePayerAccountPrivateKeyString,
    networkType,
  );
  const userServiceStoragePublicAccount = PublicAccount.createFromPublicKey(
    createAndSetUpNewAccountInfo.userServiceStorageAccountPublicKeyString,
    networkType,
  );
  const userMultisigAccount = Account.createFromPrivateKey(
    createAndSetUpNewAccountInfo.userMultisigAccountPrivateKeyString,
    networkType,
  );
  const userCosigner1Account = Account.createFromPrivateKey(
    createAndSetUpNewAccountInfo.userCosigner1AccountPrivateKeyString,
    networkType,
  );
  const userCosigner2Account = Account.createFromPrivateKey(
    createAndSetUpNewAccountInfo.userCosigner2AccountPrivateKeyString,
    networkType,
  );
  const userCosigner3Account = Account.createFromPrivateKey(
    createAndSetUpNewAccountInfo.userCosigner3AccountPrivateKeyString,
    networkType,
  );

  logger.debug('embeddedTransferTransaction');
  const deadline = Deadline.create(epochAdjustment);
  const messageJson: CreateAndSetUpNewAccountMessage = {
    serviceId: userServiceStoragePublicAccount.address.plain(),
    serviceName: 'Symbol Eternal Storage',
    userId: createAndSetUpNewAccountInfo.userId,
    userMultisigAccountAddress: userMultisigAccount.address.plain(),
    type: 'createAndSetUpNewAccount',
  };
  const messageString = JSON.stringify(messageJson);
  const embeddedTransferTransaction = TransferTransaction.create(
    deadline,
    userMultisigAccount.address,
    [],
    PlainMessage.create(messageString),
    networkType,
  ).toAggregate(userServiceFeePayerAccount.publicAccount);

  logger.debug('embeddedMultisigAccountModificationTransaction');
  const minApprovalDelta = 2;
  const minRemovalDelta = 2;
  const cosigner1Address = userCosigner1Account.address;
  const cosigner2Address = userCosigner2Account.address;
  const cosigner3Address = userCosigner3Account.address;
  const addressAdditions: UnresolvedAddress[] = [cosigner1Address, cosigner2Address, cosigner3Address];
  const addressDeletions: UnresolvedAddress[] = [];
  const embeddedMultisigAccountModificationTransaction = MultisigAccountModificationTransaction.create(
    deadline,
    minApprovalDelta,
    minRemovalDelta,
    addressAdditions,
    addressDeletions,
    networkType,
  ).toAggregate(userMultisigAccount.publicAccount);

  logger.debug('embeddedAccountAddressRestrictionTransaction1of4');
  const addressRestrictionFlag = AddressRestrictionFlag.AllowIncomingAddress;
  const restrictionAdditionsForUserMultisigAccount: UnresolvedAddress[] = [
    userServiceFeePayerAccount.address,
    userServiceStoragePublicAccount.address,
    // userMultisigAccount.address,
    userCosigner1Account.address,
    userCosigner2Account.address,
    userCosigner3Account.address,
  ];
  const restrictionDeletionsForUserMultisigAccount: UnresolvedAddress[] = [];
  const embeddedUserMultisigAccountRestrictionTransaction = AccountAddressRestrictionTransaction.create(
    deadline,
    addressRestrictionFlag,
    restrictionAdditionsForUserMultisigAccount,
    restrictionDeletionsForUserMultisigAccount,
    networkType,
  ).toAggregate(userMultisigAccount.publicAccount);

  logger.debug('embeddedAccountAddressRestrictionTransaction2of4');
  const restrictionAdditionsForCosigner1Account: UnresolvedAddress[] = [
    userServiceFeePayerAccount.address,
    userServiceStoragePublicAccount.address,
    userMultisigAccount.address,
    // userCosigner1Account.address,
    userCosigner2Account.address,
    userCosigner3Account.address,
  ];
  const restrictionDeletionsForCosigner1Account: UnresolvedAddress[] = [];
  const embeddedUserCosigner1AccountRestrictionTransaction = AccountAddressRestrictionTransaction.create(
    deadline,
    addressRestrictionFlag,
    restrictionAdditionsForCosigner1Account,
    restrictionDeletionsForCosigner1Account,
    networkType,
  ).toAggregate(userCosigner1Account.publicAccount);

  logger.debug('embeddedAccountAddressRestrictionTransaction3of4');
  const restrictionAdditionsForCosigner2Account: UnresolvedAddress[] = [
    userServiceFeePayerAccount.address,
    userServiceStoragePublicAccount.address,
    userMultisigAccount.address,
    userCosigner1Account.address,
    // userCosigner2Account.address,
    userCosigner3Account.address,
  ];
  const restrictionDeletionsForCosigner2Account: UnresolvedAddress[] = [];
  const embeddedUserCosigner2AccountRestrictionTransaction = AccountAddressRestrictionTransaction.create(
    deadline,
    addressRestrictionFlag,
    restrictionAdditionsForCosigner2Account,
    restrictionDeletionsForCosigner2Account,
    networkType,
  ).toAggregate(userCosigner2Account.publicAccount);

  logger.debug('embeddedAccountAddressRestrictionTransaction4of4');
  const restrictionAdditionsForCosigner3Account: UnresolvedAddress[] = [
    userServiceFeePayerAccount.address,
    userServiceStoragePublicAccount.address,
    userMultisigAccount.address,
    userCosigner1Account.address,
    userCosigner2Account.address,
    // userCosigner3Account.address,
  ];
  const restrictionDeletionsForCosigner3Account: UnresolvedAddress[] = [];
  const embeddedUserCosigner3AccountRestrictionTransaction = AccountAddressRestrictionTransaction.create(
    deadline,
    addressRestrictionFlag,
    restrictionAdditionsForCosigner3Account,
    restrictionDeletionsForCosigner3Account,
    networkType,
  ).toAggregate(userCosigner3Account.publicAccount);

  logger.debug('aggregateCompleteTransaction');
  const embeddedTransactions = [
    embeddedTransferTransaction,
    embeddedMultisigAccountModificationTransaction,
    embeddedUserMultisigAccountRestrictionTransaction,
    embeddedUserCosigner1AccountRestrictionTransaction,
    embeddedUserCosigner2AccountRestrictionTransaction,
    embeddedUserCosigner3AccountRestrictionTransaction,
  ];
  const initialEmptyCosignatures: AggregateTransactionCosignature[] = [];
  const feeMultiplier = 100;
  const requiredCosignatories = 5;
  const aggregateCompleteTransaction = AggregateTransaction.createComplete(
    deadline,
    embeddedTransactions,
    networkType,
    initialEmptyCosignatures,
  ).setMaxFeeForAggregate(feeMultiplier, requiredCosignatories);

  // Note: ここから必要な署名を集めていく(トランザクションをアナウンスするアカウント(serviceFeePayerAccount)の署名1アカウント分+その他連署4アカウント分)

  // Note: まず最初に最終的にトランザクションをアナウンスするアカウントで署名。
  logger.debug('signing aggregateCompleteTransaction by serviceFeePayerAccount');
  const partialSignedAggregateCompleteTransaction = userServiceFeePayerAccount.sign(
    aggregateCompleteTransaction,
    networkGenerationHash,
  );

  // Note: 連署データを保持する配列を初期化する。この後各アカウントで連署データ作る毎に配列に追加していき、全部そろったら改めてトランザクションに連署データをセットする。
  logger.debug('initializing cosignatures');
  const cosignatures = [];

  // Note: 連署1/4
  logger.debug('cosigning 1/4 aggregateCompleteTransaction by userMultisigAccount');
  const cosignedTransactionByUserMultisigAccount = CosignatureTransaction.signTransactionPayload(
    userMultisigAccount,
    partialSignedAggregateCompleteTransaction.payload,
    networkGenerationHash,
  );
  const cosignatureByUserMultisigAccount = new CosignatureSignedTransaction(
    cosignedTransactionByUserMultisigAccount.parentHash,
    cosignedTransactionByUserMultisigAccount.signature,
    cosignedTransactionByUserMultisigAccount.signerPublicKey,
  );
  cosignatures.push(cosignatureByUserMultisigAccount);

  // Note: 連署2/4
  logger.debug('cosigning 2/4 aggregateCompleteTransaction by userCosigner1Account');
  const cosignedTransactionByUserCosigner1Account = CosignatureTransaction.signTransactionPayload(
    userCosigner1Account,
    partialSignedAggregateCompleteTransaction.payload,
    networkGenerationHash,
  );
  const cosignatureByUserCosigner1Account = new CosignatureSignedTransaction(
    cosignedTransactionByUserCosigner1Account.parentHash,
    cosignedTransactionByUserCosigner1Account.signature,
    cosignedTransactionByUserCosigner1Account.signerPublicKey,
  );
  cosignatures.push(cosignatureByUserCosigner1Account);

  // Note: 連署3/4
  logger.debug('cosigning 3/4 aggregateCompleteTransaction by userCosigner2Account');
  const cosignedTransactionByUserCosigner2Account = CosignatureTransaction.signTransactionPayload(
    userCosigner2Account,
    partialSignedAggregateCompleteTransaction.payload,
    networkGenerationHash,
  );
  const cosignatureByUserCosigner2Account = new CosignatureSignedTransaction(
    cosignedTransactionByUserCosigner2Account.parentHash,
    cosignedTransactionByUserCosigner2Account.signature,
    cosignedTransactionByUserCosigner2Account.signerPublicKey,
  );
  cosignatures.push(cosignatureByUserCosigner2Account);

  // Note: 連署4/4
  logger.debug('cosigning 4/4 aggregateCompleteTransaction by userCosigner3Account');
  const cosignedTransactionByUserCosigner3Account = CosignatureTransaction.signTransactionPayload(
    userCosigner3Account,
    partialSignedAggregateCompleteTransaction.payload,
    networkGenerationHash,
  );
  const cosignatureByUserCosigner3Account = new CosignatureSignedTransaction(
    cosignedTransactionByUserCosigner3Account.parentHash,
    cosignedTransactionByUserCosigner3Account.signature,
    cosignedTransactionByUserCosigner3Account.signerPublicKey,
  );
  cosignatures.push(cosignatureByUserCosigner3Account);

  // Note: 連署データをトランザクションにセットする
  logger.debug('setting cosignatures to aggregateCompleteTransaction');
  const aggregateCompleteTransactionWithCosignatures = TransactionMapping.createFromPayload(
    partialSignedAggregateCompleteTransaction.payload,
  ) as AggregateTransaction;
  const signedAggregateCompleteTransactionWithCosignatures = userServiceFeePayerAccount.signTransactionGivenSignatures(
    aggregateCompleteTransactionWithCosignatures,
    cosignatures,
    networkGenerationHash,
  );

  // Note: トランザクションのアナウンスに失敗した場合に備え、再アナウンス可能なデータをDBに保存
  const transactionHash = signedAggregateCompleteTransactionWithCosignatures.hash;
  const transactionId = transactionHash;
  const transactionPayload = signedAggregateCompleteTransactionWithCosignatures.payload;
  logger.debug({
    transactionHash,
    transactionPayload,
  });
  const now = new Date();
  const transaction: AdminUserTransaction = {
    transactionId,
    transactionHash,
    transactionPayload,
    transactionStatus: 'PENDING',
    transactionCreatedAt: now,
    transactionUpdatedAt: now,
  };
  await db
    .doc(`v/1/types/admin/users/${createAndSetUpNewAccountInfo.userId}/transactions/${transactionId}`)
    .set(transaction);

  // Note: 1st try to announce
  const nodeUrl = `https://${selectRandomNode()}:3001`;
  logger.debug({ nodeUrl });
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const transactionRepository = repositoryFactory.createTransactionRepository();
  const listener = repositoryFactory.createListener();
  const errors = [];
  try {
    await listener.open();
    listener.status(userMultisigAccount.address).subscribe(async (transactionStatusError) => {
      logger.error({ transactionStatusError });
      const error = Error('transaction announce error');
      errors.push(error);
      const transactionStatusUpdate: Partial<AdminUserTransaction> = {
        transactionStatus: 'ERROR',
        transactionUpdatedAt: new Date(),
      };
      await db
        .doc(`v/1/types/admin/users/${createAndSetUpNewAccountInfo.userId}/transactions/${transactionId}`)
        .set(transactionStatusUpdate, { merge: true });
      throw error;
    });
    listener.unconfirmedAdded(userMultisigAccount.address).subscribe(async (unconfirmedTransaction) => {
      logger.debug({ unconfirmedTransaction });
      const transactionInfo = unconfirmedTransaction.transactionInfo as TransactionInfo;
      const hash = transactionInfo.hash;
      logger.debug({ hash });
      if (hash !== transactionHash) {
        return;
      }
      const transactionStatusUpdate: Partial<AdminUserTransaction> = {
        transactionStatus: 'UNCONFIRMED',
        transactionUpdatedAt: new Date(),
      };
      await db
        .doc(`v/1/types/admin/users/${createAndSetUpNewAccountInfo.userId}/transactions/${transactionId}`)
        .set(transactionStatusUpdate, { merge: true });
    });
    listener.confirmed(userMultisigAccount.address).subscribe(async (confirmedTransaction) => {
      logger.debug({ confirmedTransaction });
      const transactionInfo = confirmedTransaction.transactionInfo as TransactionInfo;
      const hash = transactionInfo.hash;
      logger.debug({ hash });
      if (hash !== transactionHash) {
        return;
      }
      const now = new Date();
      const transactionStatusUpdate: Partial<AdminUserTransaction> = {
        transactionStatus: 'CONFIRMED',
        transactionUpdatedAt: now,
      };
      await db
        .doc(`v/1/types/admin/users/${createAndSetUpNewAccountInfo.userId}/transactions/${transactionId}`)
        .set(transactionStatusUpdate, { merge: true });
      const adminUserUpdate: Partial<AdminUser> = {
        userMultisigAccountModified: true,
        userAccountRestricted: true,
        userAccountPrepared: true,
        userUpdatedAt: now,
      };
      await db
        .doc(`v/1/types/admin/users/${createAndSetUpNewAccountInfo.userId}`)
        .set(adminUserUpdate, { merge: true });
      listener.close();
    });
    listener.newBlock().subscribe((newBlock) => {
      logger.debug({ newBlock });
    });
    transactionRepository
      .announce(signedAggregateCompleteTransactionWithCosignatures)
      .subscribe((transactionAnnounceResponse) => {
        logger.debug(transactionAnnounceResponse);
      });
  } catch (error) {
    logger.error(error);
    errors.push(error);
    listener.close();
  }

  if (errors.length === 0) {
    logger.debug('success on 1st try');
    logger.debug('sendAggregateCompleteTransactionToCreateAndSetUpNewAccount end');
  }

  logger.error('failed on 1st try');
  logger.error('sendAggregateCompleteTransactionToCreateAndSetUpNewAccount end');
};
