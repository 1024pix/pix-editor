import Component from '@ember/component';
import {inject as service} from '@ember/service';
import $ from 'jquery';
import {alias} from '@ember/object/computed';

export default Component.extend({
  classNames:['field'],
  store:service(),
  loading:alias("tutorials.isPending"),
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
    // this.set('titleSearch', {})
  },
  getSearchTutorialResults(setting, callback) {
    let query = setting.urlData.query;
    this.get('store').query('tutorial', {
      filterByFormula: `FIND('${query}', Titre)`,
      maxRecords: 4,
      sort: [{field: 'Titre', direction: 'asc'}]
    })
      .then((tutorials) => {
        const results = tutorials.map(tutorial => ({title: tutorial.get('title'), id: tutorial.get('id')}));
        results.push({title:'Nouveau <i class="add icon"></i>',  description: 'Ajouter un tutoriel',id:'create'});
        callback({
          success: true,
          results: results
        });
      })
  },
  actions: {

    selectTutorial(tutorials, item){
      const searchClass = this.get('searchClass');
      const searchInput = $(`.search-tuto-${searchClass}`);
      if(item.id === 'create'){
        const openModal = this.get('openModal');
        openModal(tutorials,searchInput.search("get value"))
      }else{
        return this.get('store').findRecord('tutorial', item.id)
          .then((tutorial)=>{
            tutorials.pushObject(tutorial);
            setTimeout(()=>{
              searchInput.search("set value", "")
            },1)
          })
      }
      setTimeout(()=>{
        searchInput.search("set value", "")
      },1);
    },
    unselectTutorial(tutorials,tutorial){
      tutorials.removeObject(tutorial)
    },


  }
});
