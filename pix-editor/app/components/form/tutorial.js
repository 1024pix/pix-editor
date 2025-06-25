import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

function parseTitleAndNotes(query) {
  const hasNote = query.includes('[');

  if (!hasNote) {
    return { title: query, notes: null };
  }

  const [, title, notes] = query.match(/^(.+?)\[(.+?)\]/);
  return { title, notes };
}

function formattedOptionList(list) {
  return list.map((option) => ({ label: option, value: option }));
}

export default class TutorialForm extends Component {
  @tracked sourceList = [];
  @tracked tagListOptions = [];
  @tracked currentQuery;
  @service config;
  @service notify;
  @service store;
  @service idGenerator;

  options = {
    format: ['audio', 'frise', 'image', 'jeu', 'outil', 'page', 'pdf', 'site', 'slide', 'son', 'vidéo'],
    level: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    license: ['CC-BY-SA', '(c)', 'Youtube'],
  };

  get formattedFormatOptionList() {
    return formattedOptionList(this.options.format);
  }

  get formattedLevelOptionList() {
    return formattedOptionList(this.options.level);
  }

  get formattedLicenseOptionList() {
    return formattedOptionList(this.options.license);
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

  @action
  async getSearchTagsResults(query) {
    this.currentQuery = query;
    if (!query || query.length === 0) return;
    const queryLowerCase = query.toLowerCase();
    this.tagListOptions = await this.store.query('tag', {
      filter: {
        title: queryLowerCase,
      },
    })
      .then((tags) => {
        const results = tags.map((tag) => ({ label: tag.get('title'), value: tag.get('id') }));
        results.push({ label: 'Ajouter', description: 'Créer un tag[note]', value: 'create' });
        return results;
      });
  }

  get sourceListOptions() {
    return this.sourceList.map((item) => ({
      label: item,
      value: item,
    }));
  }

  @action
  async getSearchSourceResults(query) {
    if (!query) {
      this.sourceList = [];
      return;
    }
    const queryLowerCaseWithEscapedQuote = query.toLowerCase().replaceAll('\'', '\\\'');
    this.sourceList = await this.store.query('tutorial', {
      filter: {
        source: queryLowerCaseWithEscapedQuote,
      },
    })
      .then((tutorials) => {
        const results = tutorials.map((tutorial) => (tutorial.get('source')));
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
        const { title, notes } = parseTitleAndNotes(this.currentQuery);
        const storedTag = await this.store.createRecord('tag', {
          title,
          notes,
        }).save();
        tags.push(storedTag);
        this.tagListOptions.push({ label: storedTag.title, value: storedTag.id });
      } catch (err) {
        if (err?.errors?.[0]?.status === '409') {
          this.notify.error('Un tag avec ce nom là existe déjà');
        } else {
          this.notify.error('Erreur lors de la création du tag');
          Sentry.captureException(err);
        }
      }
    } else {
      this.args.tutorial.tags = await this.store.query('tag', {
        filter: {
          ids: selectedTagIds,
        },
      });
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
}
