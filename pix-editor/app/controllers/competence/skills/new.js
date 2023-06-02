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

  @service changelogEntry;
  @service loader;
  @service notify;
  @service store;
  
  @action
  cancelEdit() {
    this.edition = false;
    this.notify.message('Création annulée');
    this.parentController.send('closeChildComponent');
    this.store.deleteRecord(this.skill);
  }

  @action
  async save() {
    this.loader.start();
    const skill = this.skill;
    const tube = this.tube;
    try {
      skill.tube = tube;
      skill.version = tube.getNextSkillVersion(skill.level);
      await skill.save();
      await this._handleSkillChangelog(skill, this.defaultSaveSkillChangelog, this.changelogEntry.createAction);
      this.edition = false;
      this.loader.stop();
      this.notify.message('Acquis créé');
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error('Erreur lors de la création de l\'acquis');
    }
  }
}
