import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SidebarSearchComponent extends Component {

  routeModel = null;

  @service store;
  @service router;

  async searchSkillsByName(skillName) {
    const skills = await this.store.query('skill', {
      filterByFormula: `FIND('${skillName.toLowerCase()}', LOWER(Nom))`,
      maxRecords: 20,
      sort: [{ field: 'Nom', direction: 'asc' }]
    });
    return skills.map(skill => ({
      isSkill: true,
      title: skill.name,
      status: skill.status,
      statusCSS: skill.statusCSS,
      version: skill.version,
      transition: {
        route: 'authenticated.skill',
        model: skill.name,
      },
    }));
  }

  async searchChallengesById(challengeId) {
    const challenges = await this.store.query('challenge', {
      filter: {
        ids: [challengeId],
      },
    });
    return challenges.map(challenge => ({
      title: challenge.id,
      transition: {
        route: 'authenticated.challenge',
        model: challenge.id,
      },
    }));
  }

  async searchChallengesByText(text) {
    const challenges = await this.store.query('challenge', {
      filter: {
        search: text.toLowerCase(),
      },
      page: {
        size: 20,
      },
    });
    return challenges.map(challenge => ({
      title: challenge.instruction.substr(0, 100),
      transition: {
        route: 'authenticated.challenge',
        model: challenge.id,
      },
    }));
  }

  @action
  async getSearchResults(query) {
    query = query.trim();
    if (query.startsWith('@')) {
      return this.searchSkillsByName(query);
    } else if (query.startsWith('rec') || query.startsWith('challenge')) {
      return this.searchChallengesById(query);
    }
    return this.searchChallengesByText(query);
  }

  @action
  linkTo({ transition }) {
    const router = this.router;
    this.args.close();
    router.transitionTo(transition.route, transition.model);
  }

}
