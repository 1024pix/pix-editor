import Model, { attr } from '@warp-drive/legacy/model';

export default class LocalizedFrameworkTube extends Model {
  @attr tubeId;
  @attr locale;
  @attr maxLevel;
}
