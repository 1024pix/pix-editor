import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { uniqBy } from 'lodash';

export default class SidebarSearch extends Component {
  routeModel = null;

  @service store;
  @service router;
  @tracked searchResults = [];

  statusToIcon = {
    validated: '🟢',
    suggested: '🔵',
    archived: '⬜️',
    deleted: '🔴',
    '': '❓',
  };

  get searchResultOptions() {
    return this.searchResults.map((result) => {
      if (!result.isSkill) {
        return {
          value: result.transition.model,
          label: result.title,
        };
      }

      const icon = this.statusToIcon[result.statusCSS];
      return {
        value: result.transition.model,
        label: `${icon} ${result.title}${result.version ? ` v${result.version}` : ''}`,
      };
    });
  }

  async searchSkillsByName(skillName) {
    const skills = await this.store.query('skill', {
      filter: { name: skillName },
      page: { limit: 20 },
      sort: 'name,-version',
    });
    return skills.map((skill) => ({
      isSkill: true,
      title: skill.name,
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
    const challenges = await this.store.query('challenge', { filter: { ids: [challengeId] } });
    return challenges.map((challenge) => ({
      title: challenge.id,
      transition: {
        route: 'authenticated.challenge',
        model: challenge.id,
      },
    }));
  }

  async searchLocalizedChallengesById(localizedChallengeId) {
    const results = await this.store.query('localized-challenge', { filter: { ids: [localizedChallengeId] } });
    return results.map((result) => ({
      title: result.id,
      transition: {
        route: 'authenticated.challenge',
        model: result.id,
      },
    }));
  }

  async searchChallengesByText(text) {
    const challenges = await this.store.query('challenge', {
      filter: { search: text.toLowerCase() },
      page: { size: 20 },
    });
    return challenges.map((challenge) => ({
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
    if (query.length === 0) {
      this.searchResults = [];
    } else if (query.startsWith('@')) {
      this.searchResults = await this.searchSkillsByName(query);
    } else if (query.startsWith('rec') || query.startsWith('challenge')) {
      const challenges = await this.searchChallengesById(query);
      const localizedChallenges = await this.searchLocalizedChallengesById(query);
      this.searchResults = uniqBy([...challenges, ...localizedChallenges], 'id');
    } else {
      this.searchResults = await this.searchChallengesByText(query);
    }
    return this.searchResults;
  }

  @action
  linkTo({ transition }) {
    const router = this.router;
    this.args.close();
    router.transitionTo(transition.route, transition.model);
  }

  @action
  linkToModelId(modelId) {
    const model = this.searchResults.find((result) => result.transition.model === modelId);
    if (!model) return;
    this.args.close();
    this.router.transitionTo(model.transition.route, model.transition.model);
  }

  <template>
    <PixSelect
      @isSearchable={{true}}
      @searchLabel="Rechercher..."
      @searchPlaceholder={{"@patate1, recABCD1234"}}
      @placeholder={{"Acquix ou recordId"}}
      @options={{this.searchResultOptions}}
      @onSearch={{this.getSearchResults}}
      @onChange={{this.linkToModelId}}
      @iconName="search"
      @value=""
      @hideDefaultOption={{true}}
      class="sidebar-search"
      @emptySearchMessage={{"Pas de résultat"}}
    >
      <:label>
        <span class="sr-only">Rechercher un acquis ou une épreuve...</span>
      </:label>
    </PixSelect>
  </template>
}
