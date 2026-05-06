import Model, { attr } from '@ember-data/model';

export default class ModulesSummary extends Model {
  @attr title;
  @attr isBeta;
  @attr visibility;
  @attr level;
}
