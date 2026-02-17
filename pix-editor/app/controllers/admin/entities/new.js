import Controller from '@ember/controller';
import { service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class NewAdminEntityController extends Controller {
  @service loader;
  @service notifications;
  @service router;
  @service store;

  get schema() {
    return this.model.schema;
  }

  get fieldsToDisplay() {
    return this.model.schema.fields.filter(({ readonly }) => !readonly);
  }

  onSubmit = async (data) => {
    try {
      this.loader.start("Création de l'entité en cours...");

      const newEntity = this.store.createRecord('admin-entity');
      newEntity.properties = data;
      await newEntity.save({ adapterOptions: { entityName: this.model.schema.entityName } });

      this.notifications.success('Entité créée avec succès');
      this.router.transitionTo('admin.entities.list', this.model.schema.entityName);
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
      this.notifications.error("Erreur lors de la création de l'entité");
    }
  };
}
