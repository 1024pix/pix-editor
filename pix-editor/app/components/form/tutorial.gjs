import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';
import Select from 'pixeditor/components/field/select';

function formattedOptionList(list) {
  return list.map((option) => ({ label: option, value: option }));
}

// TRADUCTIONS PIXSELECT
const selectTranslationList = {
  tutorialLevel: { placeholder: 'Niveau non renseigné' },
  tutorialLicence: { placeholder: 'Licence non renseignée' },
  tutorialSource: {
    searchLabel: 'Rechercher une source',
    searchPlaceholder: 'Rechercher une source',
  },
};

// TRADUCTIONS PIXMULTISELECT
const multiselectTranslationList = {
  placeholder: 'cloud clavier ...',
  searchPlaceholder: 'Rechercher un tag',
  emptyMessage: 'Aucun tag',
};

const formatOptionList = formattedOptionList([
  'audio',
  'frise',
  'image',
  'jeu',
  'outil',
  'page',
  'pdf',
  'site',
  'slide',
  'son',
  'vidéo',
]);
const levelOptionList = formattedOptionList(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
const licenseOptionList = formattedOptionList(['CC-BY-SA', '(c)', 'Youtube']);

export default class TutorialForm extends Component {
  @tracked sourceList = [];
  @tracked tagListOptions = [];
  @tracked currentQuery;
  @service config;
  @service notifications;
  @service store;

  constructor() {
    super(...arguments);
    if (this.args.tutorial.source) {
      this.sourceList.push(this.args.tutorial.source);
    }
    const tags = this.args.tutorial.hasMany('tags').value() ?? [];
    this.tagListOptions = tags.map((tag) => ({ label: tag.get('title'), value: tag.get('id') }));
  }

  get hasSelectedTag() {
    return this.selectedTags.length > 0;
  }

  get tutorialLanguageOptions() {
    return Object.entries(this.config.tutorialLocaleToLanguageMap).map(([value, label]) => ({ value, label }));
  }

  get tutorialTagIds() {
    const tags = this.args.tutorial.hasMany('tags').value() ?? [];
    return tags.map(({ id }) => id);
  }

  get sourceListOptions() {
    return formattedOptionList(this.sourceList);
  }

  @action
  async getSearchTagsResults(query) {
    this.currentQuery = query;
    if (!query || query.length === 0) {
      const tags = this.args.tutorial.hasMany('tags').value() ?? [];
      this.tagListOptions = tags.map((tag) => ({ label: tag.get('title'), value: tag.get('id') }));
      return;
    }
    const queryLowerCase = query.toLowerCase();
    this.tagListOptions = await this.store.query('tag', { filter: { title: queryLowerCase } }).then((tags) => {
      const results = tags.map((tag) => ({ label: tag.get('title'), value: tag.get('id') }));
      results.push({ label: 'Ajouter', description: 'Créer un tag', value: 'create' });
      return results;
    });
  }

  @action
  async getSearchSourceResults(query) {
    if (!query) {
      this.sourceList = [];
      return;
    }
    const queryLowerCaseWithEscapedQuote = query.toLowerCase().replaceAll("'", "\\'");
    this.sourceList = await this.store
      .query('tutorial', { filter: { source: queryLowerCaseWithEscapedQuote } })
      .then((tutorials) => {
        const results = tutorials.map((tutorial) => tutorial.get('source'));
        results.push(query);
        return results.reduce((uniques, item) => {
          return uniques.includes(item) ? uniques : [...uniques, item];
        }, []);
      });
  }

  @action
  async onChangeTags(selectedTagIds) {
    if (!selectedTagIds || selectedTagIds.length === 0) {
      this.args.tutorial.tags = [];
      return;
    }
    const tags = await this.args.tutorial.tags;
    const shouldCreate = selectedTagIds.includes('create');
    if (shouldCreate) {
      try {
        const title = this.currentQuery;
        const storedTag = await this.store.createRecord('tag', { title }).save();
        tags.push(storedTag);
        this.tagListOptions.push({ label: storedTag.title, value: storedTag.id });
      } catch (err) {
        if (err?.errors?.[0]?.status === '409') {
          this.notifications.sendError('Un tag avec ce nom là existe déjà');
        } else {
          this.notifications.sendError('Erreur lors de la création du tag');
        }
      }
    } else {
      this.args.tutorial.tags = await this.store.query('tag', { filter: { ids: selectedTagIds } });
    }
  }

  @action
  async unselectTag(tagId) {
    const tags = await this.args.tutorial.tags;
    this.args.tutorial.tags = tags.filter((tag) => tag.id !== tagId);
  }

  @action
  toggleCrush() {
    this.args.tutorial.crush = !this.args.tutorial.crush;
  }

  @action
  setTutorialLanguage(language) {
    this.args.tutorial.language = language;
  }

  @action
  setLink(inputEvent) {
    this.args.tutorial.link = inputEvent.target.value;
  }

  @action
  setTitle(inputEvent) {
    this.args.tutorial.title = inputEvent.target.value;
  }

  @action
  setDuration(inputEvent) {
    this.args.tutorial.duration = inputEvent.target.value;
  }

  @action
  onSubmit(e) {
    e.preventDefault();
    this.args.onSubmit();
  }

  <template>
    <form id="tutorial-form" class="tutorial-form" {{on "submit" this.onSubmit}}>
      <div class="span-two">
        <PixInput
          @requiredLabel="Le titre est requis"
          @value={{@tutorial.title}}
          placeholder="Comment manger une pomme"
          {{on "input" this.setTitle}}
        >
          <:label>Titre</:label>
        </PixInput>
      </div>
      <Select
        @options={{this.tutorialLanguageOptions}}
        @onChange={{this.setTutorialLanguage}}
        @texts={{selectTranslationList.tutorialLanguage}}
        @value={{@tutorial.language}}
        @hideDefaultOption={{true}}
        @required={{true}}
      >
        <:label>Langue</:label>
      </Select>
      <PixInput
        @requiredLabel="Le lien est requis"
        @value={{@tutorial.link}}
        placeholder="http://example.org"
        {{on "input" this.setLink}}
      >
        <:label>Lien</:label>
      </PixInput>
      <Select
        @options={{this.sourceListOptions}}
        @onChange={{fn (mut @tutorial.source)}}
        @onSearch={{this.getSearchSourceResults}}
        @value={{@tutorial.source}}
        @isSearchable={{true}}
        @texts={{selectTranslationList.tutorialSource}}
        @hideDefaultOption={{true}}
        @required={{true}}
      >
        <:label>Source</:label>
      </Select>
      <Select
        @options={{licenseOptionList}}
        @onChange={{fn (mut @tutorial.license)}}
        @value={{@tutorial.license}}
        @hideDefaultOption={{false}}
        @texts={{selectTranslationList.tutorialLicence}}
      >
        <:label>Licence</:label>
      </Select>
      <Select
        @options={{formatOptionList}}
        @onChange={{fn (mut @tutorial.format)}}
        @value={{@tutorial.format}}
        @texts={{selectTranslationList.tutorialFormat}}
        @hideDefaultOption={{true}}
        @required={{true}}
      >
        <:label>Format</:label>
      </Select>
      <PixInput
        @requiredLabel="La durée est requise"
        @value={{@tutorial.duration}}
        placeholder="03:54:39"
        {{on "input" this.setDuration}}
      >
        <:label>Durée (hh:mm:ss)</:label>
      </PixInput>
      <Select
        @options={{levelOptionList}}
        @onChange={{fn (mut @tutorial.level)}}
        @value={{@tutorial.level}}
        @hideDefaultOption={{false}}
        @texts={{selectTranslationList.tutorialLevel}}
      >
        <:label>Niveau</:label>
      </Select>
      <div class="tutorial-tags-select">
        <PixMultiSelect
          @isSearchable={{true}}
          @onSearch={{this.getSearchTagsResults}}
          @onChange={{this.onChangeTags}}
          @values={{this.tutorialTagIds}}
          @texts={{multiselectTranslationList}}
          @options={{this.tagListOptions}}
        >
          <:label>Rechercher tags</:label>
          <:default as |option|>
            <div class="search-title">
              {{#if (eq option.value "create")}}
                {{option.label}}
                <i class="add icon"></i>
              {{else}}
                {{option.label}}
              {{/if}}
            </div>
            <div class="search-description">
              {{#if option.description}}
                {{option.description}}
              {{/if}}
            </div>
          </:default>
        </PixMultiSelect>
      </div>
      <div class="span-two">
        {{#if @tutorial.tags.length}}
          <label>Tags</label>
          <section class="tags">
            {{#each @tutorial.tags as |tag|}}
              <span class="tag">
                {{tag.title}}
                <PixIconButton
                  @ariaLabel="Supprimer le tag: {{tag.title}}"
                  @iconName="close"
                  @triggerAction={{fn this.unselectTag tag.id}}
                  @size="small"
                  class="delete-tag-button"
                />
              </span>
            {{/each}}
          </section>
        {{/if}}
      </div>
      <label class="span-three">
        Coup de coeur
        <PixIconButton
          @ariaLabel="Coup de coeur"
          @iconName="favorite"
          @plainIcon={{@tutorial.crush}}
          @triggerAction={{this.toggleCrush}}
          @size="big"
          class="crush-button"
        />
      </label>
      <p class="span-three">* champ obligatoire</p>
    </form>
  </template>
}
