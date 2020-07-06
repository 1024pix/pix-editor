import Model, { attr } from '@ember-data/model';

export default class NoteModel extends Model {

  @attr text;
  @attr challengeId;
  @attr author;
  @attr competence;
  @attr skills;
  @attr production;
  @attr createdAt;
  @attr status;
  @attr('boolean', { defaultValue: false }) changelog;

  get date() {
    const createdDate = this.createdAt;
    return (new Date(createdDate)).toLocaleDateString('fr');
  }
}
