import Model, { attr } from '@warp-drive/legacy/model';

export default class Country extends Model {
  @attr code;
  @attr name;
}
