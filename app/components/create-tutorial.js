import PopinBase from "./popin-base";
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';


export default PopinBase.extend({
  isCrush: false,
  edition: true,
  // haveTagsSelected:computed('selectedTags', function(){
  //   const selectedTags = this.selectedTags;
  //   console.log(!(isEmpty(selectedTags)));
  //   return !(isEmpty(selectedTags));
  //   // return (!(selectedTags.length = 0));
  // }),
  haveTagsSelected:false,
  options: {
    'format': ["vidéo", "image", "son", "site", "pdf", "slide", "outil", "page", "jeu", "audio", "frise", "video"],
    'level': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  store: service(),
  query: '',
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },
  init() {
    this._super(...arguments);
    let that = this;
    this.searchErrors = {
      noResults: 'Pas de résultat'
    };
    this.searchAPISettings = {
      responseAsync: function (settings, callback) {
        that.getSearchResults(settings, callback);
      }
    };
    this.set('selectedTags', []);
    this.set('item', {})
  },
  getSearchResults(setting, callback) {
    let query = setting.urlData.query;
    this.get('store').query('tag', {
      filterByFormula: `FIND('${query}', Nom)`,
      maxRecords: 4,
      sort: [{field: 'Nom', direction: 'asc'}]
    })
      .then((tags) => {
        const results = tags.map(tag => ({title: tag.get('title'), id: tag.get('id')}));
        callback({
          success: true,
          results: results
        });
      })
  },
  actions: {
    selectTag(item) {
      const selectedTags = this.get('selectedTags');
      return this.get('store').findRecord('tag', item.id)
        .then((tag) => {
          if (selectedTags.indexOf(tag) === -1) {
            selectedTags.pushObject(tag);
            this.set('haveTagsSelected', true);
            //Try to reset search
            // const searchInput = $('.search-tag-input');
            // searchInput.search({});
            // searchInput.search("set value", "");
            // searchInput.search("query");
          }
        });
    },
    unselectTag(id) {
      const selectedTags = this.get('selectedTags');
      selectedTags.forEach((tag) => {
        if (tag.id === id) {
          selectedTags.removeObject(tag)
        }
      });
      if(isEmpty(selectedTags)){
        this.set('haveTagsSelected', false)
      }
    },
    saveTutorial(item) {
      this.get("application").send("isLoading");
      let isCrush = this.get('isCrush');
      const selectedTags = this.get('selectedTags');
      const date = new Date();
      item.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      item.crush = isCrush ? 'yes' : "";
      item.tags = selectedTags;
      this.store.createRecord('tutorial', item).save()
        .then(() => {
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Tutoriel créé", true);
          this.set('item', {});
          this.set('selectedTags', []);
        })
        .catch((error) => {
          console.error(error);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Erreur lors de la création de l'acquis", true);
        })
    }

    ,
    toCrush() {
      let isCrush = !this.get('isCrush');
      this.set('isCrush', isCrush);
    }

  }
});
