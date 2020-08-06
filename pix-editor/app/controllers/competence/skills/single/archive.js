import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class CompetenceSkillsSingleArchiveController extends Controller {
  @alias('model')
  skill;

  @service router;

  get size() {
    if (this.router.currentRouteName == 'competence.skills.single.archive.index') {
      return 'full';
    } else {
      return 'half';
    }
  }

  get challengeList() {
    return this.skill.challenges.toArray().sort((a,b) => {
      if (a.version > b.version) {
        return 1;
      } else if (a.version < b.version) {
        return -1;
      } else if (a.isPrototype) {
        return -1;
      } else if (b.isPrototype) {
        return 1;
      }
      return 0;
    });
  }

  get alternativesCount() {
    return this.skill.challenges.filter(challenge => !challenge.isPrototype).length;
  }

  get prototypesCount() {
    return this.skill.challenges.filter(challenge => challenge.isPrototype).length;
  }

}
