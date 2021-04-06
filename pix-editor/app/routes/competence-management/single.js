import Route from '@ember/routing/route';

export default class CompetenceManagementSingleRoute extends Route {

  model(params) {
    return this.store.peekRecord('competence', params.competence_id);
  }
}
