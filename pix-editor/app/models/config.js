import Model, { attr } from '@warp-drive/legacy/model';

export default class ConfigModel extends Model {
  @attr storagePost;
  @attr storageBucket;
  @attr localeToLanguageMap;
  @attr tutorialLocaleToLanguageMap;
}
