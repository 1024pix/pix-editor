import { PixFilterBanner, PixMultiSelect, PixSearchInput, PixToggle } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Select from 'pixeditor/components/field/select';

// TRADUCTIONS PIXSELECT
const selectTranslationList = {
  placeholder: "Filtrer par statut d'erreur",
};

// TRADUCTIONS PIXMULTISELECT
const emptySearchMessage = 'Aucun résultat';
const multiselectTranslationList = {
  challenge: { placeholder: 'Filtrer par épreuve', searchLabel: 'Rechercher une épreuve', emptySearchMessage },
  skill: { placeholder: 'Filtrer par acquis', searchLabel: 'Rechercher un acquis', emptySearchMessage },
  tutorial: { placeholder: 'Filtrer par tutoriel', searchLabel: 'Rechercher un tutoriel', emptySearchMessage },
  framework: { placeholder: 'Filtrer par référentiel', searchLabel: 'Rechercher un référentiel', emptySearchMessage },
};

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function filterOptions(options, search) {
  if (!search?.trim()) return options;
  const normalizedSearch = normalize(search.trim());
  return options.filter(({ label }) => normalize(String(label ?? '')).includes(normalizedSearch));
}

export default class BrokenUrlFilters extends Component {
  @tracked skillSearch = '';
  @tracked localizedChallengeSearch = '';
  @tracked tutorialSearch = '';
  @tracked frameworkSearch = '';

  get filteredSkillOptionList() {
    return filterOptions(this.skillOptionList, this.skillSearch);
  }

  get filteredLocalizedChallengeOptionList() {
    return filterOptions(this.localizedChallengeOptionList, this.localizedChallengeSearch);
  }

  get filteredTutorialOptionList() {
    return filterOptions(this.tutorialOptionList, this.tutorialSearch);
  }

  get filteredFrameworksOptionList() {
    return filterOptions(this.frameworksOptionList, this.frameworkSearch);
  }

  @action
  searchSkill(value) {
    this.skillSearch = value;
  }

  @action
  searchLocalizedChallenge(value) {
    this.localizedChallengeSearch = value;
  }

  @action
  searchTutorial(value) {
    this.tutorialSearch = value;
  }

  @action
  searchFramework(value) {
    this.frameworkSearch = value;
  }

  get statusCodeOptionList() {
    const statusCodes = new Set(this.args.brokenUrls.map((brokenUrl) => brokenUrl.statusCode.toString()));
    return Array.from(statusCodes)
      .sort((a, b) => a - b)
      .map((statusCode) => ({ label: statusCode, value: statusCode }));
  }

  get skillOptionList() {
    const skillsById = new Map();
    for (const brokenUrl of this.args.brokenUrls) {
      const skills = brokenUrl.hasMany('skills').value() ?? [];
      for (const skill of skills) {
        skillsById.set(skill.id, skill.name);
      }
    }
    return Array.from(skillsById, ([value, label]) => ({ value, label }));
  }

  get localizedChallengeOptionList() {
    const ids = new Set();
    for (const brokenUrl of this.args.brokenUrls) {
      for (const challenge of brokenUrl.hasMany('localizedChallenges').value() ?? []) {
        ids.add(challenge.id);
      }
    }
    return Array.from(ids, (id) => ({ label: id, value: id }));
  }

  get tutorialOptionList() {
    const ids = new Map();
    for (const brokenUrl of this.args.brokenUrls) {
      for (const tutorial of brokenUrl.hasMany('tutorials').value() ?? []) {
        ids.set(tutorial.id, tutorial.title);
      }
    }
    return Array.from(ids.entries(), ([id, title]) => ({ label: title, value: id }));
  }

  get frameworksOptionList() {
    const names = new Set();
    for (const brokenUrl of this.args.brokenUrls) {
      for (const name of brokenUrl.frameworks) {
        names.add(name);
      }
    }
    return Array.from(names, (name) => ({ label: name, value: name }));
  }

  @action
  triggerSkillFilter(skills) {
    return this.args.onApplyFiltersClicked('skills', skills);
  }

  @action
  triggerLocalizedChallengeFilter(localizedChallenges) {
    return this.args.onApplyFiltersClicked('localizedChallenges', localizedChallenges);
  }

  @action
  triggerTutorialFilter(tutorials) {
    return this.args.onApplyFiltersClicked('tutorials', tutorials);
  }

  @action
  triggerUrlFilter(_id, url) {
    return this.args.onApplyFiltersClicked('url', url);
  }

  @action
  triggerStatusCodeFilter(statusCode) {
    return this.args.onApplyFiltersClicked('statusCode', statusCode);
  }

  @action
  triggerFrameworkFilter(frameworks) {
    return this.args.onApplyFiltersClicked('frameworks', frameworks);
  }

  @action
  triggerIgnoredFilter() {
    return this.args.onApplyFiltersClicked('ignored', !this.args.ignoredFilterValue);
  }

  <template>
    <PixFilterBanner
      @clearFiltersLabel="Réinitialiser les filtres"
      @onClearFilters={{@onClearFiltersClicked}}
      @isClearFilterButtonDisabled={{false}}
    >
      <PixSearchInput
        @id="url-filter"
        @placeholder="Entrer une URL"
        @value={{@urlFilterValue}}
        @debounceTimeInMs="0"
        @triggerFiltering={{this.triggerUrlFilter}}
        @screenReaderOnly={{true}}
      >
        <:label>URL à remplir</:label>
      </PixSearchInput>
      <Select
        @id="status-filter"
        @options={{this.statusCodeOptionList}}
        @value={{@statusCodeFilterValue}}
        @texts={{selectTranslationList}}
        @onChange={{this.triggerStatusCodeFilter}}
        @screenReaderOnly={{true}}
      >
        <:label>{{selectTranslationList.placeholder}}</:label>
      </Select>
      {{#if @showTutorialsFilters}}
        <PixMultiSelect
          @id="tutorials-filter"
          @options={{this.filteredTutorialOptionList}}
          @onSearch={{this.searchTutorial}}
          @values={{@tutorialFilterValues}}
          @onChange={{this.triggerTutorialFilter}}
          @screenReaderOnly={{true}}
          @isSearchable={{true}}
          @texts={{multiselectTranslationList.tutorial}}
        >
          <:label>Filtrer par tutoriel</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
        <PixMultiSelect
          @id="skill-filter"
          @options={{this.filteredSkillOptionList}}
          @onSearch={{this.searchSkill}}
          @values={{@skillFilterValues}}
          @onChange={{this.triggerSkillFilter}}
          @screenReaderOnly={{true}}
          @isSearchable={{true}}
          @texts={{multiselectTranslationList.skill}}
        >
          <:label>Filtrer par acquis</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
      {{/if}}
      {{#if @showChallengesFilters}}
        <PixMultiSelect
          @id="localized-challenges-filter"
          @options={{this.filteredLocalizedChallengeOptionList}}
          @onSearch={{this.searchLocalizedChallenge}}
          @values={{@localizedChallengeFilterValues}}
          @onChange={{this.triggerLocalizedChallengeFilter}}
          @screenReaderOnly={{true}}
          @isSearchable={{true}}
          @texts={{multiselectTranslationList.challenge}}
        >
          <:label>Filtrer par épreuve</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
      {{/if}}
      <PixMultiSelect
        @id="frameworks-filter"
        @options={{this.filteredFrameworksOptionList}}
        @onSearch={{this.searchFramework}}
        @values={{@frameworkFilterValues}}
        @onChange={{this.triggerFrameworkFilter}}
        @screenReaderOnly={{true}}
        @isSearchable={{true}}
        @texts={{multiselectTranslationList.framework}}
      >
        <:label>Filtrer par référentiel</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
      <PixToggle @checked={{@ignoredFilterValue}} {{on "change" this.triggerIgnoredFilter}}>
        Afficher les URL ignorées
      </PixToggle>
    </PixFilterBanner>
  </template>
}
