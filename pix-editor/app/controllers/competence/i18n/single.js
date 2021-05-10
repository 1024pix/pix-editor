import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

export default class CompetenceI18nSingleController extends Controller {

  @controller('competence')
  parentController;

  get isMaximized() {
    return this.parentController.leftMaximized;
  }

  get skill() {
    return this.model;
  }

  get challengesByLanguagesAndAlternativesCount() {
    const challengeByLanguagesAndAlternativesCount = [];
    const challenges = this.skill.validatedChallenges;
    const languagesAndAlternativesCount = this.skill.languagesAndAlternativesCount;
    for (const [language, alternativesCount] of languagesAndAlternativesCount) {
      const challenge = challenges.find(challenge => challenge.locales && challenge.locales.includes(language));
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
