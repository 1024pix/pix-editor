import Model, { attr } from '@ember-data/model';

export default class ConfigModel extends Model {
  @attr storagePost;
  @attr storageBucket;
  @attr localeToLanguageMap;
  @attr tutorialLocaleToLanguageMap;
}
