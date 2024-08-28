import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class ConfigService extends Service {
  @service store;
  @service access;
  @service intl;

  @tracked author;
  @tracked accessLevel;
  @tracked airtableUrl;
  @tracked airtableBase;
  @tracked tableChallenges;
  @tracked tableSkills;
  @tracked tableTubes;
  @tracked storagePost;
  @tracked storageBucket;
  @tracked localeToLanguageMap;
  @tracked tutorialLocaleToLanguageMap;
  @tracked llmVariationsUrl;
  @tracked llmVariationsToken;

  async load() {
    const currentUser = await this.store.queryRecord('user', { me: true });
    const config = await this.store.findRecord(
      'config',
      'pix-editor-global-config'
    );

    this.author = currentUser.trigram;
    this.accessLevel = this.access.getLevel(currentUser.access);
    this.airtableUrl = config.airtableUrl;
    this.airtableBase = config.airtableBase;
    this.tableChallenges = config.tableChallenges;
    this.tableSkills = config.tableSkills;
    this.tableTubes = config.tableTubes;
    this.storagePost = config.storagePost;
    this.storageBucket = config.storageBucket;
    this.localeToLanguageMap = config.localeToLanguageMap;
    this.tutorialLocaleToLanguageMap = config.tutorialLocaleToLanguageMap;
    this.llmVariationsUrl = config.llmVariationsUrl;
    this.llmVariationsToken = config.llmVariationsToken;
    this.intl.setLocale(['fr']);

    Sentry.setUser({ userName: this.author });
  }
}
