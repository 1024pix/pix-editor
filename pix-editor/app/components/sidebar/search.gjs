import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { uniqBy } from 'lodash';

import SelectSearch from '../field/select-search';

export default class SidebarSearchComponent extends Component {
  @tracked resultList = [];
  @tracked result = null;

  routeModel = null;

  @service store;
  @service router;

  async searchSkillsByName(skillName) {
    const skills = await this.store.query('skill', {
      filter: {
        name: skillName,
      },
      page: { limit: 20 },
      sort: 'name',
    });
    return skills.map((skill) => ({
      isSkill: true,
      value: skill.id,
      label: `${skill.name} v${skill.version}`,
      status: skill.status,
      statusCSS: skill.statusCSS,
      version: skill.version,
      transition: {
        route: 'authenticated.skill',
        model: skill.pixId,
      },
    }));
  }

  async searchChallengesById(challengeId) {
    const challenges = await this.store.query('challenge', {
      filter: {
        ids: [challengeId],
      },
    });
    return challenges.map((challenge) => ({
      value: challenge.id,
      label: challenge.id,
      transition: {
        route: 'authenticated.challenge',
        model: challenge.id,
      },
    }));
  }

  async searchLocalizedChallengesById(localizedChallengeId) {
    const results = await this.store.query('localized-challenge', {
      filter: {
        ids: [localizedChallengeId],
      },
    });
    return results.map((result) => ({
      value: result.id,
      label: result.id,
      transition: {
        route: 'authenticated.challenge',
        model: result.id,
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
    return challenges.map((challenge) => ({
      value: challenge.id,
      label: challenge.instruction.substr(0, 100),
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
      this.resultList = await this.searchSkillsByName(query);
    } else if (query.startsWith('rec') || query.startsWith('challenge')) {
      const challenges = await this.searchChallengesById(query);
      const localizedChallenges = await this.searchLocalizedChallengesById(query);
      this.resultList = uniqBy([...challenges, ...localizedChallenges], 'id');
    } else {
      this.resultList = await this.searchChallengesByText(query);
    }
  }

  @action
  setResultList(list) {
    this.resultList = list;
  }

  @action
  linkTo(item) {
    const [searchInput] = document.getElementById('container-select-sidebar-search').getElementsByClassName('pix-select-search__input');
    const { transition } = this.resultList.find((result) => result.value === item);
    this.resultList = [];
    const router = this.router;
    searchInput.value = '';
    this.args.close();
    router.transitionTo(transition.route, transition.model);
  }

  <template>
    {{#if @displaySearch}}
      <SelectSearch
        @selectId="select-sidebar-search"
        @resultList={{this.resultList}}
        @setResultList={{this.setResultList}}
        @getResults={{this.getSearchResults}}
        @onChange={{this.linkTo}}
        @hideDefaultOption={{true}}
        @searchPlaceholder="Acquix ou recordId" />
    {{/if}}
  </template>
}
