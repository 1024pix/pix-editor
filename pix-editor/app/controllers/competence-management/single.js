import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';

export default class CompetenceManagementSingleController extends Controller {

  @service access;
  @service notify;
  @service loader;

  @tracked edition = false;

  get competence() {
    return this.model;
  }

  get mayEdit() {
    return this.access.isAdmin() && !this.edition;
  }

  @action
  edit() {
    this.edition = true;
  }

  @action
  cancelEdit() {
    this.edition = false;
    const competence = this.model;
    competence.rollbackAttributes();
    this.notify.message('Modification annulée');
  }

  @action
  save() {
    this.loader.start();
    const competence = this.model;
    return competence.save()
      .then(()=> {
        this.edition = false;
        this.loader.stop();
        this.notify.message('Compétence mise à jour');
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la mise à jour de la compétence');
      });
  }
}
