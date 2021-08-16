import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class Tutorials extends Component {

  @tracked displayTutorialPopin = false;
  @tracked newTutorial = null;
  defaultTitle = '';

  @service store;

  @service idGenerator;
  @service notify;
  @service loader;

  _searchTutorial(query, tagSearch) {
    return this.store.query('tutorial', {
      filterByFormula: tagSearch ? `FIND('${query}', LOWER(Tags))` : `FIND('${query}', LOWER(Titre))`,
      maxRecords: 100,
      sort: [{ field: 'Titre', direction: 'asc' }]
    })
      .then((tutorials) => {
        const tagsLoad = tutorials.map(tutorial => tutorial.tags);
        return Promise.all(tagsLoad)
          .then(() => tutorials);
      })
      .then((tutorials) => {
        const results = tutorials.map((tutorial) => {
          const haveTags = tagSearch ? true : tutorial.tagsTitle !== null && tutorial.tagsTitle !== '';
          return {
            title: tutorial.title,
            description: haveTags ? `TAG : ${tutorial.tagsTitle}` : false,
            id: tutorial.id
          };
        });
        results.push({ title: 'Nouveau ', description: 'Ajouter un tutoriel', id: 'create' });
        return results;
      });
  }

  @action
  addTutorial(item, options) {
    if (item.id === 'create') {
      const date = new Date();
      this.newTutorial = this.store.createRecord('tutorial', { pixId: this.idGenerator.newId('tutorial'), title: options.searchText, date:`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` });
      this.displayTutorialPopin = true;
    } else {
      return this.store.findRecord('tutorial', item.id)
        .then((tutorial) => {
          this.args.addTutorial(tutorial);
        });
    }
  }

  @action
  getSearchTutorialResults(query) {
    query = query.toLowerCase();
    let tagSearch = false;
    if (query[0] === '>') {
      query = query.substring(1);
      tagSearch = true;
    }
    return this._searchTutorial(query, tagSearch);
  }

  @action
  closeTutorialPopin() {
    this.displayTutorialPopin = false;
  }

  @action
  saveTutorial() {
    this.displayTutorialPopin = false;
    this.loader.start();
    this.newTutorial.save()
      .then((tutorial) => {
        this.loader.stop();
        this.notify.message('Tutoriel créé');
        this.args.addTutorial(tutorial);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la création du tutoriel');
      });
  }

}
