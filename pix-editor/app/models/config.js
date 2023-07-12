import Model, { attr } from '@ember-data/model';

export default class ConfigModel extends Model {
  @attr airtableUrl;
  @attr airtableDatabaseId;
  @attr tableChallenges;
  @attr tableSkills;
  @attr tableTubes;
  @attr storagePost;
  @attr storageBucket;
  @attr localeToLanguageMap;
}
