import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CompetenceSkillsSingleArchiveController extends Controller {

  @controller('authenticated.competence') competenceController;

  get skill() {
    return this.model;
  }

  @service router;

  @tracked rightMaximized = false;

  get size() {
    if (this.router.currentRouteName == 'authenticated.competence.skills.single.archive.index') {
      return 'full';
    } else {
      return 'half';
    }
  }

  get challengeList() {
    return this.skill.challengesArray
      .slice()
      .sort((a, b) => {
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
    return this.skill.challengesArray.filter((challenge) => !challenge.isPrototype).length;
  }

  get prototypesCount() {
    return this.skill.prototypes.length;
  }

  maximizeRight(value) {
    if (this.rightMaximized != value) {
      this.rightMaximized = value;
    }
  }

  @action
  closeChildComponent() {
    this.maximizeRight(false);
    this.router.transitionTo('authenticated.competence.skills.single.archive');
  }

}
