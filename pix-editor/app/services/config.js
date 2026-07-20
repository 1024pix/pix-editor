import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ConfigService extends Service {
  @service store;
  @service access;
  @service intl;

  @tracked author;
  @tracked accessLevel;
  @tracked storagePost;
  @tracked storageBucket;
  @tracked localeToLanguageMap;
  @tracked tutorialLocaleToLanguageMap;

  async load() {
    const currentUser = await this.store.queryRecord('user', { me: true });
    const config = await this.store.findRecord('config', 'pix-editor-global-config');

    this.author = currentUser.trigram;
    this.accessLevel = this.access.getLevel(currentUser.access);
    this.storagePost = config.storagePost;
    this.storageBucket = config.storageBucket;
    this.localeToLanguageMap = config.localeToLanguageMap;
    this.tutorialLocaleToLanguageMap = config.tutorialLocaleToLanguageMap;
    this.intl.setLocale(['fr']);
  }
}
