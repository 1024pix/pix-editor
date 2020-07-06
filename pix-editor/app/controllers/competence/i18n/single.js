import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';

export default class CompetenceI18nSingleController extends Controller {

  @controller('competence')
  parentController;

  @alias('parentController.leftMaximized')
  isMaximized;

  @alias('model')
  skill;

  get challengesByLanguagesAndAlternativesCount() {
    const challengeByLanguagesAndAlternativesCount = [];
    const challenges = this.skill.validatedChallenges;
    const languagesAndAlternativesCount = this.skill.languagesAndAlternativesCount;
    for (const [language, alternativesCount] of languagesAndAlternativesCount) {
      const challenge = challenges.find(challenge => challenge.languages && challenge.languages.includes(language));
      challengeByLanguagesAndAlternativesCount.push({ challenge, language, alternativesCount });
    }
    return challengeByLanguagesAndAlternativesCount;
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

}
