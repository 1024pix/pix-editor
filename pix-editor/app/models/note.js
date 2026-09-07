import Model, { attr } from '@warp-drive/legacy/model';

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
