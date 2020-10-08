import Model, { attr } from '@ember-data/model';

export default class ConfigModel extends Model {
  @attr airtableUrl;
  @attr tableChallenges;
  @attr tableSkills;
  @attr tableTubes;
  @attr storagePost;
  @attr storageTenant;
  @attr storageUser;
  @attr storagePassword;
  @attr storageKey;
  @attr storageAuth;
  @attr pixStaging;
  @attr pixAdminUserEmail;
  @attr pixAdminUserPassword;
}
