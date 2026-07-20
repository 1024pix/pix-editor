import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CompetenceManagementSingleController extends Controller {
  @service access;
  @service notifications;
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
    this.notifications.sendSuccess('Modification annulée');
  }

  @action
  save() {
    this.loader.start();
    const competence = this.model;
    return competence
      .save()
      .then(() => {
        this.edition = false;
        this.loader.stop();
        this.notifications.sendSuccess('Compétence mise à jour');
      })
      .catch((error) => {
        /* eslint-disable-next-line no-console */
        console.error(error);
        this.loader.stop();
        this.notifications.sendError('Erreur lors de la mise à jour de la compétence');
      });
  }
}
