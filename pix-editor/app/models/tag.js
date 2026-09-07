import Model, { attr } from '@warp-drive/legacy/model';

export default class TagModel extends Model {
  @attr title;
  @attr pixId;
}
