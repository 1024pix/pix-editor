import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SidebarSearchComponent extends Component {

  routeModel = null;

  @service store;
  @service router;

  @action
  getSearchResults(query) {
    query = query.trim();
    if (query.substr(0, 1) === '@') {
      this.routeModel = 'skill';
      return this.store.query('skill', {
        filterByFormula: `FIND('${query.toLowerCase()}', LOWER(Nom))`,
        maxRecords: 20,
        sort: [{ field: 'Nom', direction: 'asc' }]
      })
        .then(skills => {
          return skills.map(skill => ({
            title: skill.name,
            name: skill.name
          }));
        });
    } else if (query.substr(0, 3) === 'rec') {
      this.routeModel = 'challenge';
      return this.store.query('challenge', {
        filterByFormula: `AND(FIND('${query}', {id persistant}))`,
        maxRecords: 20
      })
        .then(challenges => {
          return challenges.map(challenge => ({
            title: challenge.pixId,
            id: challenge.pixId
          }));
        });
    } else {
      this.routeModel = 'challenge';
      return this.store.query('challenge', {
        filterByFormula: `AND(FIND('${query.toLowerCase().replace(/'/g, '\\\'')}', LOWER(CONCATENATE(Consigne,Propositions,{Embed URL}))) , Statut != 'archive')`,
        maxRecords: 20
      })
        .then(challenges => {
          return challenges.map(challenge => ({
            title: challenge.instructions.substr(0, 100),
            id: challenge.id
          }));
        });
    }
  }

  @action
  linkTo(item) {
    const route = this.routeModel;
    const router = this.router;
    this.args.close();
    if (route === 'skill') {
      router.transitionTo(route, item.name);
    } else {
      router.transitionTo(route, item.id);
    }
  }

}
