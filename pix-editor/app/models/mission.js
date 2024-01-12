import Model, { attr } from '@ember-data/model';

export default class Mission extends Model {
  @attr name;
  @attr competenceId;
  @attr thematicId;
  @attr createdAt;
  @attr status;
  @attr learningObjectives;
  @attr validatedObjectives;
}
