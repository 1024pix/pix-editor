import Controller from '@ember/controller';
import {action} from '@ember/object';
import {alias} from '@ember/object/computed';
import {inject as controller} from '@ember/controller';

export default class CompetenceI18nSingleController extends Controller {

  @controller('competence')
  parentController;

  @alias('parentController.leftMaximized')
  isMaximized;

  @alias('model')
  skill;

  get challengesByLanguagesAndAlternativesCount() {
    const challengeByLanguagesAndAlternativesCount = []
    const challenges = this.skill.validatedChallenges;
    const languagesAndAlternativesCount = this.skill.languagesAndAlternativesCount;
    for ( let [language, alternativesCount] of languagesAndAlternativesCount ){
      const challenge = this._findChallengeByLanguage(language,challenges)
      challengeByLanguagesAndAlternativesCount.push({challenge,language,alternativesCount});
    }
    return challengeByLanguagesAndAlternativesCount;
  }

  _findChallengeByLanguage(language, challenges){
    for (let i = 0; i < challenges.length; i++) {
     if(challenges[i].languages && challenges[i].languages.includes(language)){
       return challenges[i]
     }
    }
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
