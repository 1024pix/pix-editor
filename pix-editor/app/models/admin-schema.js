import Model, { attr } from '@ember-data/model';

export default class AdminSchemaModel extends Model {
  @attr label;
  @attr editable;
  @attr deletable;
  @attr creatable;
  @attr entityName;
  @attr fields;
  @attr defaultSort;
}
