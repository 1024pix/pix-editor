import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class Tutorials extends Component {
  @tracked tutorialList = [];
  @tracked displayTutorialPopin = false;
  @tracked tutorial = null;

  @service store;

  @service idGenerator;
  @service notify;
  @service loader;

  async _searchTutorial(query) {
    if (!query || query.length === 0 || query === '>') {
      return [];
    }
    const filter = {};
    if (query.startsWith('>')) {
      filter.tagTitles = query
        .split('>')
        .filter((tag) => tag)
        .map((tag) => tag.trim());
    } else {
      filter.title = query.replace(/'/g, '\\\'');
    }
    const tutorials = await this.store.query('tutorial', { filter });
    const tagsLoad = tutorials.map((tutorial) => tutorial.tags);
    await Promise.all(tagsLoad);

    return tutorials.map((tutorial) => {
      const haveTags = filter.tagTitles ? true : tutorial.tagsTitle !== null && tutorial.tagsTitle !== '';
      return {
        label: tutorial.title,
        description: haveTags ? `TAG : ${tutorial.tagsTitle}` : false,
        value: tutorial.id,
      };
    });
  }

  @action
  async attachTutorial(itemId) {
    const tutorial = await this.store.findRecord('tutorial', itemId);
    this.args.addTutorial(this.args.tutorials, tutorial);
  }

  @action
  addTutorial(e) {
    e.preventDefault();
    this.tutorial = this.store.createRecord('tutorial');
    this.displayTutorialPopin = true;
  }

  @action
  editTutorial(tutorial) {
    this.tutorial = tutorial;
    this.displayTutorialPopin = true;
  }

  @action
  async getSearchTutorialResults(query) {
    this.tutorialList = await this._searchTutorial(query.toLowerCase());
  }

  @action
  closeTutorialPopin() {
    this.tutorial.rollbackAttributes();
    this.displayTutorialPopin = false;
  }

  @action
  async saveTutorial() {
    this.loader.start();
    try {
      if (this.tutorial.link) {
        this.tutorial.link = this.tutorial.link.replaceAll(' ', '');
        new URL(this.tutorial.link);
      }
    } catch {
      this.loader.stop();
      this.notify.error('Lien du tutoriel non valide');
      return;
    }
    try {
      const tutorial = await this.tutorial.save();
      this.notify.message('Tutoriel créé');
      this.args.addTutorial(this.args.tutorials, tutorial);
      this.displayTutorialPopin = false;
    } catch (error) {
      Sentry.captureException(error);
      this.notify.error('Erreur lors de la création du tutoriel');
    } finally {
      this.loader.stop();
    }
  }

  @action
  setTutorialList(list) {
    this.tutorialList = list;
  }

  get selectId() {
    return `select-tutorial-${this.args.searchId}`;
  }
}
