import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class Tutorials extends Component {

  @tracked displayTutorialPopin = false;
  @tracked tutorial = null;
  defaultTitle = '';

  @service store;

  @service idGenerator;
  @service notify;
  @service loader;

  async _searchTutorial(query) {
    let tagSearch = false;
    if (query.startsWith('>')) {
      tagSearch = query
        .split('>')
        .filter((tag) => tag)
        .map((tag) => `FIND('${tag.trim()}', LOWER(Tags))`)
        .join(', ');
    }
    const tutorials = await this.store.query('tutorial', {
      filterByFormula: tagSearch ? `AND(${tagSearch})` : `FIND('${query.replace(/'/g, '\\\'')}', LOWER(Titre))`,
      maxRecords: 100,
      sort: [{ field: 'Titre', direction: 'asc' }],
    });
    const tagsLoad = tutorials.map((tutorial) => tutorial.tags);
    await Promise.all(tagsLoad);

    const results = tutorials.map((tutorial) => {
      const haveTags = tagSearch ? true : tutorial.tagsTitle !== null && tutorial.tagsTitle !== '';
      return {
        title: tutorial.title,
        description: haveTags ? `TAG : ${tutorial.tagsTitle}` : false,
        id: tutorial.id,
      };
    });
    return results;
  }

  @action
  async attachTutorial(item) {
    const tutorial = await this.store.findRecord('tutorial', item.id);
    this.args.addTutorial(this.args.tutorials, tutorial);
  }

  @action
  addTutorial(e) {
    e.preventDefault();
    const date = new Date();
    this.tutorial = this.store.createRecord('tutorial', {
      pixId: this.idGenerator.newId('tutorial'),
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
    });
    this.displayTutorialPopin = true;
  }

  @action
  editTutorial(tutorial, e) {
    e.preventDefault();
    this.tutorial = tutorial;
    this.displayTutorialPopin = true;
  }

  @action
  getSearchTutorialResults(query) {
    return this._searchTutorial(query.toLowerCase());
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

}
