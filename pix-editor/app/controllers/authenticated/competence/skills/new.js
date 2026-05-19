import { action } from '@ember/object';
import { service } from '@ember/service';
import * as Sentry from '@sentry/ember';

import Skill from './single';

export default class NewController extends Skill {
  competence = null;
  tubeId = null;
  defaultSaveSkillChangelog = "Création de l'acquis";

  get skill() {
    return this.model;
  }

  @service changelogEntry;
  @service loader;
  @service notifications;
  @service store;

  @action
  cancelEdit() {
    this.edition = false;
    this.notifications.sendSuccess('Création annulée');
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
      this.notifications.sendSuccess('Acquis créé');
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notifications.sendError("Erreur lors de la création de l'acquis");
    }
  }
}
