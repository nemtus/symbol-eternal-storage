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

export interface UploadEncryptedFileChunkMessage extends BaseMessage {
  type: 'uploadEncryptedFileChunk';
  fileId: string; // Note: 各サービスで管理しているファイルのID
  fileSize: number; // Notwe: ファイルサイズ
  fileTimeCreated: string; // Note: 各サービスで管理しているプラットフォーム上でのファイルの作成日時
  fileUpdated: string; // Note: 各サービスで管理しているプラットフォーム上でのファイルの更新日時
  fileMd5Hash: string; // Note: ファイルのMD5ハッシュ
  fileMimeType: string; // Note: ファイルのMIMEタイプ
  chunkIndex: number; // Note: ファイルデータ分割分の何番目のデータか
  chunkLength: number; // Note: ファイルデータを結果的に合計いくつに分割したか
}
