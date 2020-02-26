import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Tutorials extends Component {

  @service store;
  _searchTutorial(query, tagSearch) {
    return this.store.query('tutorial', {
      filterByFormula: tagSearch ? `FIND('${query}', LOWER(Tags))` : `FIND('${query}', LOWER(Titre))`,
      maxRecords: 100,
      sort: [{field: 'Titre', direction: 'asc'}]
    })
      .then((tutorials) => {
        const titleLoad = tutorials.map(tutorial => tutorial.tagsTitle);
        return Promise.all(titleLoad)
          .then(() => tutorials);
      })
      .then((tutorials) => {
        const results = tutorials.map((tutorial) => {
          const haveTags = tagSearch ? true : tutorial.tagsTitle.content !== null && tutorial.tagsTitle.content !== '';
          return {
            title: tutorial.title,
            description: haveTags ? `TAG : ${tutorial.tagsTitle.content}` : false,
            id: tutorial.id
          }
        });
        results.push({title: 'Nouveau ', description: 'Ajouter un tutoriel', id: 'create'});
        return results
      })
  }

  @action
  addTutorial(item) {
    const searchClass = this.args.searchClass;
    const searchInput = document.querySelector(`.search-tuto-${searchClass} .ember-power-select-search-input`);
    if (item.id === 'create') {
      const createTutorial = this.args.openCreateTutorialModal;
      createTutorial(searchInput.value)
    } else {
      return this.store.findRecord('tutorial', item.id)
        .then((tutorial) => {
          this.args.addTutorial(tutorial);
        })
    }
  }

  @action
  getSearchTutorialResults(query) {
    query=query.toLowerCase();
    let tagSearch = false;
    if (query[0] === '>') {
      query = query.substring(1);
      tagSearch = true
    }
    return this._searchTutorial(query, tagSearch)
  }

}
