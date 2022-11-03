import { NetworkType } from 'symbol-sdk';

// Note: 基本的には環境変数から解決する。解決できなかったら2022/11/02時点の現テストネットの値をセットしておく。
export const epochAdjustment = process.env.SYMBOL_NETWORK_EPOCH_ADJUSTMENT
  ? parseInt(process.env.SYMBOL_NETWORK_EPOCH_ADJUSTMENT)
  : 1637848847;
export const networkCurrencyMosaicId = process.env.SYMBOL_NETWORK_CURRENCY_MOSAIC_ID ?? '3A8416DB2D53B6C8';
export const networkGenerationHash =
  process.env.SYMBOL_NETWORK_GENERATION_HASH ?? '7FCCD304802016BEBBCD342A332F91FF1F3BB5E902988B352697BE245F48E836';
export const networkType = process.env.SYMBOL_NETWORK_NAME === 'mainnet' ? NetworkType.MAIN_NET : NetworkType.TEST_NET;
