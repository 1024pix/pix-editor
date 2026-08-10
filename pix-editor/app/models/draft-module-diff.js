import Model, { attr } from '@warp-drive/legacy/model';

export default class DraftModuleDiff extends Model {
  @attr htmlDiff;
}
