import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class AdminEntityListController extends Controller {
  @service notifications;

  queryParams = ['sort'];

  @tracked modal;
  @tracked sort;

  get entityList() {
    return this.model.entityList;
  }

  get schema() {
    return this.model.schema;
  }

  get actions() {
    const actionList = [];
    if (!this.model) return actionList;

    if (this.schema.deletable) {
      actionList.push({
        label: "Supprimer l'entité",
        iconName: 'delete',
        getModal: this.getDeleteModal,
      });
    }

    return actionList;
  }

  @action
  getDeleteModal(entity) {
    return {
      title: "Suppression d'une entité",
      description: 'Voulez-vous vraiment supprimer cette entité ? Cette action est irréversible.',
      onConfirm: async () => {
        try {
          this.modal.loading = true;
          const entityId = entity.id;
          await entity.destroyRecord();
          this.notifications.sendSuccess(`Entité '${entityId}' supprimée avec succès`);
        } catch (err) {
          Sentry.captureException(err);
          this.notifications.sendError("Erreur lors de la suppression de l'entité");
        } finally {
          this.modal.loading = false;
          this.closeModal();
        }
      },
    };
  }

  @action
  closeModal() {
    if (this.modal.isLoading) return;
    this.modal = undefined;
  }

  @action
  async onDeleteEntity(actionDetails, entity) {
    if (actionDetails.getModal) {
      this.modal = actionDetails.getModal(entity);
    } else {
      await actionDetails.handler(entity);
    }
  }
}
