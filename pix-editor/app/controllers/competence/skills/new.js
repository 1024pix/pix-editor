import Skill from './single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';

export default class NewController extends Skill {
  competence = null;
  tubeId = null;
  defaultSaveSkillChangelog = 'Création de l\'acquis';

  get skill() {
    return this.model.skill;
  }

  get tube() {
    return this.model.tube;
  }

  @service notify;
  @service loader;
  @service changelogEntry;

  @action
  cancelEdit() {
    this.store.deleteRecord(this.skill);
    this.edition = false;
    this.notify.message('Création annulée');
    this.parentController.send('closeChildComponent');
  }

  @action
  save() {
    this.loader.start();
    const skill = this.skill;
    const tube = this.tube;
    return tube.competence
      .then(competence=> {
        skill.tube = tube;
        skill.competence = [competence.get('id')];
        skill.version = tube.getNextSkillVersion(skill.level);
        return skill.save();
      })
      .then(()=>this._handleSkillChangelog(skill, this.defaultSaveSkillChangelog, this.changelogEntry.createAction))
      .then(() => {
        this.edition = false;
        this.loader.stop();
        this.notify.message('Acquis créé');
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la création de l\'acquis');
      });
  }
}
