import Model, { attr } from '@warp-drive/legacy/model';

export default class UserModel extends Model {
  @attr name;
  @attr access;
  @attr trigram;

  get lite() {
    return this.access === 'readonly';
  }
}
