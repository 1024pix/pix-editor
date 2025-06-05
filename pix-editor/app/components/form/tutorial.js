import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class TutorialForm extends Component {

  @service config;
  @service notify;
  @service store;
  @service idGenerator;

  options = {
    'format': ['audio', 'frise', 'image', 'jeu', 'outil', 'page', 'pdf', 'site', 'slide', 'son', 'vidéo'],
    'level': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    'license': ['CC-BY-SA', '(c)', 'Youtube'],
  };

  get hasSelectedTag() {
    return this.selectedTags.length > 0;
  }

  get tutorialLanguage() {
    return this.config.tutorialLocaleToLanguageMap[this.args.tutorial.language];
  }

  get tutorialLanguageOptions() {
    return Object.entries(this.config.tutorialLocaleToLanguageMap).map(([value, label]) => ({ value, label }));
  }

  @action
  getSearchTagsResults(query) {
    const queryLowerCase = query.toLowerCase();
    return this.store.query('tag', {
      filter: {
        title: queryLowerCase,
      },
    })
      .then((tags) => {
        const results = tags.map((tag) => ({ title: tag.get('title'), id: tag.get('id') }));
        results.push({ title: 'Ajouter', description: 'Créer un tag[note]', id: 'create' });
        return results;
      });
  }

  @action
  getSearchSourceResults(query) {
    const queryLowerCaseWithEscapedQuote = query.toLowerCase().replaceAll('\'', '\\\'');
    return this.store.query('tutorial', {
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
  async selectTag(item) {
    const tutorial = this.args.tutorial;
    const tags = await tutorial.tags;
    if (item.id === 'create') {
      try {
        const value = document.querySelector('.tutorial-search .ember-power-select-search-input').value;
        if (value.indexOf('[') !== -1) {
          const pos = value.indexOf('[');
          const length = value.length;
          const title = value.slice(0, pos);
          const notes = value.slice(pos + 1, length - 1);
          const tag = await this.store.createRecord('tag', {
            title: title,
            notes: notes,
          }).save();
          tags.push(tag);
        } else {
          const tag = await this.store.createRecord('tag', {
            title: value,
          }).save();
          tags.push(tag);
        }
      } catch (err) {
        if (err?.errors?.[0]?.status === '409') {
          this.notify.error('Un tag avec ce nom là existe déjà');
        } else {
          this.notify.error('Erreur lors de la création du tag');
        }
      }
    } else {
      const tag = await this.store.findRecord('tag', item.id);
      if (tags.indexOf(tag) === -1) {
        tags.push(tag);
      }
    }
  }

  @action
  async unselectTag(id) {
    const tutorial = this.args.tutorial;
    const tags = await tutorial.tags;
    this.args.tutorial.tags = tags.filter((tag) => tag.id !== id);
  }

  @action
  toggleCrush() {
    this.args.tutorial.crush = !this.args.tutorial.crush;
  }

  @action
  setTutorialLanguage(language) {
    this.args.tutorial.language = language.value;
  }
}
