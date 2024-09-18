import Model, { attr } from '@ember-data/model';

export default class AtelierSkillVersionViewModel extends Model {

  @attr status;
  @attr airtableId;
  @attr version;

  get isActive() {
    return this.status === 'actif';
  }

  get isArchived() {
    return this.status === 'archivé';
  }

  get isDraft() {
    return this.status === 'en construction';
  }

  get isObsolete() {
    return this.status === 'périmé';
  }

}
