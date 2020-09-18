import Model, { attr } from '@ember-data/model';

export default class AuthorModel extends Model {
  @attr name;
  @attr access;
  @attr trigram;

  get lite() {
    return this.access === 'readonly';
  }
}
