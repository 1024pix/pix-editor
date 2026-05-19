import Model, { attr } from '@ember-data/model';

export default class Module extends Model {
  @attr title;
  @attr isBeta;
  @attr slug;
  @attr visibility;
  @attr details;
  @attr sections;
  @attr glossary;
}
