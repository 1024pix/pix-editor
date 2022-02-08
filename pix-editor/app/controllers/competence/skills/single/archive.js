import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CompetenceSkillsSingleArchiveController extends Controller {
  
  get skill() {
    return this.model;
  }

  @service router;

  @tracked rightMaximized = false;

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

  maximizeRight(value) {
    if (this.rightMaximized != value) {
      this.rightMaximized = value;
    }
  }

  @action
  closeChildComponent() {
    this.maximizeRight(false);
    this.router.transitionTo('competence.skills.single.archive');
  }

}
