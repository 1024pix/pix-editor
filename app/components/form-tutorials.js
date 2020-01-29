import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';

export default Component.extend({
  classNames: ['field'],
  store: service(),
  loading: alias("tutorials.isPending"),

  _searchTutorial(query, tagSearch) {
    return this.get('store').query('tutorial', {
      filterByFormula: tagSearch ? `FIND('${query}', LOWER(Tags))` : `FIND('${query}', LOWER(Titre))`,
      maxRecords: 100,
      sort: [{field: 'Titre', direction: 'asc'}]
    })
      .then((tutorials) => {
        const titleLoad = tutorials.map(tutorial => tutorial.get('tagsTitle'));
        return Promise.all(titleLoad)
          .then(() => tutorials);
      })
      .then((tutorials) => {
        const results = tutorials.map((tutorial) => {
          const haveTags = tagSearch ? true : tutorial.get('tagsTitle').content !== null && tutorial.get('tagsTitle').content !== '';
          return {
            title: tutorial.get('title'),
            description: haveTags ? `TAG : ${tutorial.get('tagsTitle').content}` : false,
            id: tutorial.get('id')
          }
        });
        results.push({title: 'Nouveau ', description: 'Ajouter un tutoriel', id: 'create'});
        return results
      })
  },

  actions: {

    selectTutorial(tutorials, item) {
      const searchClass = this.get('searchClass');
      const searchInput = document.querySelector(`.search-tuto-${searchClass} .ember-power-select-search-input`);
      if (item.id === 'create') {
        const createTutorial = this.get('openCreateTutorialModal');
        createTutorial(tutorials, searchInput.value)
      } else {
        return this.get('store').findRecord('tutorial', item.id)
          .then((tutorial) => {
            tutorials.pushObject(tutorial);
          })
      }
    },
    getSearchTutorialResults(query) {
      query=query.toLowerCase();
      let tagSearch = false;
      if (query[0] === ">") {
        query = query.substring(1);
        tagSearch = true
      }
      return this._searchTutorial(query, tagSearch)
    },
    unselectTutorial(tutorials, tutorial) {
      tutorials.removeObject(tutorial)
    }
  }
})
;
