import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class CompetenceThemesSingleController extends Controller {
  @service access;
  @service config;
  @service notifications;
  @service loader;

  @tracked edition = false;

  creation = false;
  wasMaximized = false;

  get theme() {
    return this.model;
  }

  @controller('authenticated.competence')
  parentController;

  get mayEdit() {
    return this.access.mayEditSkills();
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  edit() {
    this.edition = true;
  }

  @action
  cancelEdit() {
    this.edition = false;
    this.theme.rollbackAttributes();
    this.notifications.sendSuccess('Modification annulée');
  }

  @action
  save() {
    this.loader.start();
    const theme = this.theme;
    return theme
      .save()
      .then(() => {
        this.edition = false;
        this.loader.stop();
        this.notifications.sendSuccess('Thématique mise à jour');
      })
      .catch((error) => {
        /* eslint-disable-next-line no-console */
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notifications.sendError('Erreur lors de la mise à jour de la thématique');
      });
  }
}
