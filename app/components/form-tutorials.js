import Component from '@ember/component';
import {inject as service} from '@ember/service';
import $ from 'jquery';
import {alias} from '@ember/object/computed';

export default Component.extend({
  classNames:['field'],
  popinCreateTutoClass: 'popinCreateTutoClass',
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
        results.pushObject({title:'Nouveau <i class="add icon"></i>',  description: 'Ajouter un tutoriel',id:'create'});
        callback({
          success: true,
          results: results
        });
      })
  },
  actions: {

    selectTutorial(tutorials, item){
      console.log('item:',item, 'tuto:',  tutorials);
      if(item.id === 'create'){
        $(`.${this.get('popinCreateTutoClass')}`).modal('show');
      }else{
        return this.get('store').findRecord('tutorial', item.id)
          .then((tutorial)=>{
            tutorials.pushObject(tutorial);
            setTimeout(()=>{
              $('.search-tutorial-input').search("set value", "")
            },1)
          })

      }

      setTimeout(()=>{
        $('.search-tutorial-input').search("set value", "")
      },1)
    }

  }
});
