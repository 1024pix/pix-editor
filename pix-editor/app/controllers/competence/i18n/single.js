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

  get challengesByLanguages() {
    const challenges = this.skill.productionChallenges;
    let languages = [];
    return challenges.reduce((acc, challenge) => {
      for (let i = 0; i < languages.length; i++) {
        if (!challenge.languages || this._equalArray(languages[i], challenge.languages)) {
          return acc
        }
      }
      languages.push(challenge.languages);
      acc.push(challenge);
      return acc;
    }, []);
  }

  _getAlternativeCountByLanguages(languages){
    let count = 0;
    const challenges = this.skill.productionChallenges;
    challenges.forEach(challenge=>{
      if(challenge.languages && this._equalArray(languages, challenge.languages)){
        count ++
      }
    });
    return count;
  }

  _equalArray(array, compare) {
    if(!array){
      return false;
    }
    if (array.length !== compare.length) {
      return false
    }
    for (let i = 0; i < compare.length; i++) {
      if (!array.includes(compare[i])) {
        return false
      }
    }
    return true
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
