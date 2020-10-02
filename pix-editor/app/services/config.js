import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class ConfigService extends Service {

  @service store;
  @service access;

  @tracked author;
  @tracked airtableKey;
  @tracked accessLevel;
  @tracked pixUser;
  @tracked pixPassword;
  @tracked airtableBase;
  @tracked airtableEditorBase;
  @tracked airtableUrl;
  @tracked tableChallenges;
  @tracked tableSkills;
  @tracked tableTubes;
  @tracked storagePost;
  @tracked storageTenant;
  @tracked storageUser;
  @tracked storagePassword;
  @tracked storageKey;
  @tracked storageAuth;
  @tracked pixStaging;

  async load() {
    const currentUser = await this.store.queryRecord('user', { me: true });
    const config = await this.store.findRecord('config', 'pix-editor-global-config');

    this.author = currentUser.trigram;
    this.airtableKey = config.airtableApiKey;
    this.accessLevel = this.access.getLevel(currentUser.access);
    this.pixUser = config.pixAdminUserEmail;
    this.pixPassword = config.pixAdminUserPassword;
    this.airtableBase = config.airtableBase;
    this.airtableEditorBase = config.airtableEditorBase;
    this.airtableUrl = config.airtableUrl;
    this.tableChallenges = config.tableChallenges;
    this.tableSkills = config.tableSkills;
    this.tableTubes = config.tableTubes;
    this.storagePost = config.storagePost;
    this.storageTenant = config.storageTenant;
    this.storageUser = config.storageUser;
    this.storagePassword = config.storagePassword;
    this.storageKey = config.storageKey;
    this.storageAuth = config.storageAuth;
    this.pixStaging = config.pixStaging;
  }
}
