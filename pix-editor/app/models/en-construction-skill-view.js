import Model, { attr } from '@ember-data/model';

export default class TubeOverviewModel extends Model {

  @attr name;
  @attr level;
  @attr hintStatus;
  @attr tutorialsCount;
  @attr learningMoreTutorialsCount;

}
