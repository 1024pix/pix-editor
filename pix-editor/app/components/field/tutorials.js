import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

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
      filterByFormula: tagSearch ? `AND(${tagSearch})` : `FIND('${query}', LOWER(Titre))`,
      maxRecords: 100,
      sort: [{ field: 'Titre', direction: 'asc' }]
    });
    const tagsLoad = tutorials.map(tutorial => tutorial.tags);
    await Promise.all(tagsLoad);

    const results = tutorials.map((tutorial) => {
      const haveTags = tagSearch ? true : tutorial.tagsTitle !== null && tutorial.tagsTitle !== '';
      return {
        title: tutorial.title,
        description: haveTags ? `TAG : ${tutorial.tagsTitle}` : false,
        id: tutorial.id
      };
    });
    return results;
  }

  @action
  async attachTutorial(item) {
    const tutorial = await this.store.findRecord('tutorial', item.id);
    this.args.addTutorial(tutorial);
  }

  @action
  addTutorial(e) {
    e.preventDefault();
    const date = new Date();
    this.tutorial = this.store.createRecord('tutorial', {
      pixId: this.idGenerator.newId('tutorial'),
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    });
    this.displayTutorialPopin = true;
  }

  @action
  editTutorial(tutorial) {
    this.tutorial = tutorial;
    this.displayTutorialPopin = true;
  }

  @action
  getSearchTutorialResults(query) {
    return this._searchTutorial(query.toLowerCase());
  }

  @action
  closeTutorialPopin() {
    this.displayTutorialPopin = false;
  }

  @action
  async saveTutorial() {
    this.displayTutorialPopin = false;
    this.loader.start();
    try {
      const tutorial = await this.tutorial.save();
      this.loader.stop();
      this.notify.message('Tutoriel créé');
      this.args.addTutorial(tutorial);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error('Erreur lors de la création du tutoriel');
    }
  }

}
