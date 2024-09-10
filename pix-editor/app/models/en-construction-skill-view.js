import Model, { attr } from '@ember-data/model';

export default class EnConstructionSkillViewModel extends Model {

  @attr name;
  @attr level;
  @attr hintStatus;
  @attr tutorialsCount;
  @attr learningMoreTutorialsCount;

}
