import Model, { attr } from '@ember-data/model';

export default class NoteModel extends Model {
  @attr text;
  @attr challengeId;
  @attr author;
  @attr createdAt;
  @attr status;

  get date() {
    return new Date(this.createdAt).toLocaleDateString('fr');
  }
}
