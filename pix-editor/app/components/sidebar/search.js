import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SidebarSearchComponent extends Component {

  routeModel = null;

  @service store;
  @service router;

  @action
  async getSearchResults(query) {
    query = query.trim();
    if (query.startsWith('@')) {
      const skills = await this.store.query('skill', {
        filterByFormula: `FIND('${query.toLowerCase()}', LOWER(Nom))`,
        maxRecords: 20,
        sort: [{ field: 'Nom', direction: 'asc' }]
      });
      return skills.map(skill => ({
        isSkill: true,
        title: skill.name,
        id: skill.name,
        status: skill.status,
        statusCSS: skill.statusCSS,
        version: skill.version,
        route: 'authenticated.skill',
      }));
    } else if (query.startsWith('rec') || query.startsWith('challenge')) {
      const challenges = await this.store.query('challenge', {
        filter: {
          ids: [query],
        },
      });
      return challenges.map(challenge => ({
        title: challenge.id,
        id: challenge.id,
        route: 'authenticated.challenge',
      }));
    } else {
      const challenges = await this.store.query('challenge', {
        filter: {
          search: query.toLowerCase(),
        },
        page: {
          size: 20,
        },
      });
      return challenges.map(challenge => ({
        title: challenge.instruction.substr(0, 100),
        route: 'authenticated.challenge',
        id: challenge.id,
      }));
    }
  }

  @action
  linkTo(item) {
    const route = this.routeModel;
    const router = this.router;
    this.args.close();
    if (route === 'authenticated.skill') {
      router.transitionTo(item.route, item.id);
    } else {
      router.transitionTo(item.route, item.id);
    }
  }

}
