export interface BaseMessage {
  serviceId: string; // Note: 各サービス毎に固有のアドレス
  serviceName: string; // Note: 各サービス名
  userId: string; // Note: 各サービスで管理しているユーザーのID
  userMultisigAccountAddress: string; // Note: ユーザーのマルチシグアカウントのアドレス
  type: string; // Note: 各サービスでの処理の種類
}

export interface CreateAndSetUpNewAccountMessage extends BaseMessage {
  type: 'createAndSetUpNewAccount';
}
