import Component from '@ember/component';
import {inject as service} from '@ember/service';
import $ from 'jquery';
import {alias} from '@ember/object/computed';

export default Component.extend({
  classNames: ['field'],
  store: service(),
  loading: alias("tutorials.isPending"),
  init() {
    this._super(...arguments);
    let that = this;
    this.searchErrors = {
      noResults: 'Pas de résultat'
    };
    this.searchAPISettings = {
      responseAsync(settings, callback) {
        that.getSearchTutorialResults(settings, callback);
      }
    };
  },
  getSearchTutorialResults(setting, callback) {

    let query = setting.urlData.query.toLowerCase();
    if (query[0] === ">") {
      query = query.substring(1);
      this.get('store').query('tutorial', {
        filterByFormula: `FIND('${query}', LOWER(Tags))`,
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
            return {
              title: tutorial.get('title'),
              description: `TAG : ${tutorial.get('tagsTitle').content}`,
              id: tutorial.get('id')
            }
          });
          results.push({title: 'Nouveau <i class="add icon"></i>', description: 'Ajouter un tutoriel', id: 'create'});
          callback({
            success: true,
            results: results
          });
        })
    } else {
      this.get('store').query('tutorial', {
        filterByFormula: `FIND('${query}', LOWER(Titre))`,
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
            const haveTags = tutorial.get('tagsTitle').content !== null && tutorial.get('tagsTitle').content !== '';
            return {
              title: tutorial.get('title'),
              description: haveTags ? `TAG : ${tutorial.get('tagsTitle').content}` : '',
              id: tutorial.get('id')
            }
          });
          results.push({title: 'Nouveau <i class="add icon"></i>', description: 'Ajouter un tutoriel', id: 'create'});
          callback({
            success: true,
            results: results
          });
        })
    }
  },
  actions: {

    selectTutorial(tutorials, item) {
      const searchClass = this.get('searchClass');
      const searchInput = $(`.search-tuto-${searchClass}`);
      if (item.id === 'create') {
        const openModal = this.get('openModal');
        openModal(tutorials, searchInput.search("get value"))
      } else {
        return this.get('store').findRecord('tutorial', item.id)
          .then((tutorial) => {
            tutorials.pushObject(tutorial);
            setTimeout(() => {
              searchInput.search("set value", "")
            }, 1)
          })
      }
      setTimeout(() => {
        searchInput.search("set value", "")
      }, 1);
    },
    unselectTutorial(tutorials, tutorial) {
      tutorials.removeObject(tutorial)
    }
  }
})
;
