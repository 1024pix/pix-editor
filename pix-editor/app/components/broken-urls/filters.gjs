import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import Select from 'pixeditor/components/field/select';

// TRADUCTIONS PIXSELECT
const selectTranslationList = {
  placeholder: "Filtrer par statut d'erreur",
};

// TRADUCTIONS PIXMULTISELECT
const multiselectTranslationList = {
  challenge: { placeholder: 'Filtrer par épreuve' },
  skill: { placeholder: 'Filtrer par acquis' },
  tutorial: { placeholder: 'Filtrer par tutoriel' },
};

export default class BrokenUrlFilters extends Component {
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
          @options={{this.tutorialOptionList}}
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
          @options={{this.skillOptionList}}
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
          @options={{this.localizedChallengeOptionList}}
          @values={{@localizedChallengeFilterValues}}
          @onChange={{this.triggerLocalizedChallengeFilter}}
          @screenReaderOnly={{true}}
          @isSearchable={{true}}
          @texts={{multiselectTranslationList.skill}}
        >
          <:label>Filtrer par épreuve</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
      {{/if}}
      <PixMultiSelect
        @id="frameworks-filter"
        @options={{this.frameworksOptionList}}
        @values={{@frameworkFilterValues}}
        @onChange={{this.triggerFrameworkFilter}}
        @screenReaderOnly={{true}}
        @isSearchable={{true}}
        @placeholder="Filtrer par référentiel"
      >
        <:label>Filtrer par référentiel</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
    </PixFilterBanner>
  </template>
}
