import Model, { attr } from '@ember-data/model';

export default class LocalizedFrameworkTube extends Model {
  @attr tubeId;
  @attr locale;
  @attr maxLevel;
}
