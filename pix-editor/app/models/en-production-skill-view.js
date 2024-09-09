import Model, { attr } from '@ember-data/model';

export default class TubeOverviewModel extends Model {

  @attr name;
  @attr level;
  @attr status;
  @attr hintStatus;
  @attr prototypeId;
  @attr validatedChallengesCount;
  @attr proposedChallengesCount;
  @attr tutorialsCount;
  @attr learningMoreTutorialsCount;

}
