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
    const challenges = this.skill.validatedChallenges;
    const languages = this._skillLanguages(challenges);
    return languages.reduce((acc,language)=>{
      const challenge = this._findChallengeByLanguage(language,challenges)
      acc.push({language,challenge});
      return acc
    },[])
  }

  _findChallengeByLanguage(language, challenges){
    for (let i = 0; i < challenges.length; i++) {
     if(challenges[i].languages.includes(language)){
       return challenges[i]
     }
    }
  }

   _skillLanguages(challenges) {
    return challenges.reduce((languages, challenge) => {
      return this._extractLanguagesFromChallenge(challenge.languages,languages);
    }, []);
  }

  _extractLanguagesFromChallenge(challengeLanguages, extractedLanguages){
    if (challengeLanguages && challengeLanguages.length !== 0) {
      challengeLanguages.forEach(language => {
        if (!extractedLanguages.includes(language)) {
          extractedLanguages.push(language);
        }
      });
    }
    return extractedLanguages;
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
