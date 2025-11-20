import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SingleRoute extends Route {
  @service currentData;
  @service router;
  @service store;
  @service versionManager;

  model(params) {
    return this.store.findRecord('challenge', params.prototype_id);
  }

  async afterModel(model, transition) {
    super.afterModel(model, transition);
    const skill = await model.skill;
    await model.localizedChallenges;
    if (!model) return;
    await model?.attachments;
    this.currentData.setPrototype(model);
    if (!this.versionManager.isV2) return;

    const view = transition.to.queryParams.view;
    const goingToProduction = view === 'production' || !view;
    if (!goingToProduction) return;

    const { competenceAirtableId, locale } = this.modelFor('authenticated.competence.prototypes');
    const skillId = skill.id;
    const overview = 'challenges-production';

    this.router.transitionTo('authenticated.v2.competence-overview.challenges', competenceAirtableId, overview, skillId, { queryParams: { locale } });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.edition = false;
    controller.urlsToConsult = model.urlsToConsult?.join('\n') ?? '';
    controller.invalidUrlsToConsult = '';
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('challenges');
    if (!model.isValidated) {
      if (model.isWorkbench) {
        competenceController.setView('workbench-list');
      } else {
        competenceController.setView('workbench');
      }
    } else {
      competenceController.setView('production');
    }
  }

  @action
  willTransition(transition) {
    const controller = this.controllerFor(transition.from.name);
    if (controller.edition) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        controller.send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    } else {
      if (transition.targetName === 'authenticated.competence.skills.index' || transition.targetName === 'authenticated.competence.quality.index') {
        const challenge = controller.model;
        if (!challenge.isWorkbench) {
          const skill = challenge.skill;
          if (skill) {
            if (transition.targetName === 'authenticated.competence.quality.index' && skill.get('productionPrototype')) {
              return this.router.transitionTo('authenticated.competence.quality.single', this.currentData.getCompetence(), skill);
            } else if (transition.targetName === 'authenticated.competence.skills.index') {
              return this.router.transitionTo('authenticated.competence.skills.single', this.currentData.getCompetence(), skill);
            }
          }
        }
      }
      controller.edition = false;
      return true;
    }
  }
}
