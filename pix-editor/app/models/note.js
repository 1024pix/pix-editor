import Model, { attr } from '@ember-data/model';

export default class NoteModel extends Model {

  @attr text;
  @attr recordId;
  @attr author;
  @attr createdAt;
  @attr status;
  @attr elementType;
  @attr('boolean', { defaultValue: false }) changelog;

  get date() {
    const createdDate = this.createdAt;
    return (new Date(createdDate)).toLocaleDateString('fr');
  }
}
