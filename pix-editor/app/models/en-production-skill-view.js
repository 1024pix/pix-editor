import Model, { attr } from '@ember-data/model';

export default class EnProductionSkillViewModel extends Model {

  @attr name;
  @attr level;
  @attr status;
  @attr hint;
  @attr hintStatus;
  @attr prototypeId;
  @attr isProtoDeclinable;
  @attr validatedChallengesCount;
  @attr proposedChallengesCount;
  @attr tutorialsCount;
  @attr learningMoreTutorialsCount;

}
