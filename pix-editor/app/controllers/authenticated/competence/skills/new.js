import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

import Skill from './single';

export default class NewController extends Skill {
  competence = null;
  tubeId = null;
  defaultSaveSkillChangelog = 'Création de l\'acquis';

  get skill() {
    return this.model;
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
    try {
      await this.skill.save();
      await this._handleSkillChangelog(this.skill, this.defaultSaveSkillChangelog, this.changelogEntry.createAction);
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
