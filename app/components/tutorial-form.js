import PopinBase from "./popin-base";
import {inject as service} from '@ember/service';
import {isEmpty} from '@ember/utils';


export default PopinBase.extend({
  isFavorite: false,
  edition: true,
  haveTagsSelected: false,
  store: service(),
  searchAPISettings: null,
  query: '',
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },
  init() {
    this._super(...arguments);
    let that = this;
    this.searchAPISettings = {

      responseAsync(settings, callback) {
        that.getSearchTagsResults(settings, callback);
      }
    };
    this.set('selectedTags', []);
    this.set('item', {});
    this.set('options', {
      'format': ["audio", "frise", "image", "jeu", "outil", "page", "pdf", "site", "slide", "son", "vidéo"],
      'level': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      'license': ['CC-BY-SA', '(c)', 'Youtube']
    });
  },
  getSearchTagsResults(setting, callback) {
    let query = setting.urlData.query.toLowerCase();
    this.get('store').query('tag', {
      filterByFormula: `FIND('${query}', LOWER(Nom))`,
      maxRecords: 4,
      sort: [{field: 'Nom', direction: 'asc'}]
    })
      .then((tags) => {
        const results = tags.map(tag => ({title: tag.get('title'), id: tag.get('id')}));
        results.push({title: 'Ajouter <i class="add icon"></i>', description: 'Créer un tag[note]', id: 'create'});
        callback({
          success: true,
          results: results
        });
      })
  },
  actions: {
    selectTag(item) {
      const selectedTags = this.get('selectedTags');
      if (item.id === 'create') {
        const value = this.$(`.search-tag-input`).search("get value");
        if (value.indexOf('[') !== -1) {
          const pos = value.indexOf('[');
          const length = value.length;
          const title = value.slice(0, pos);
          const notes = value.slice(pos + 1, length - 1);
          this.store.createRecord('tag', {
            title,
            notes
          }).save()
            .then((tag) => {
              selectedTags.pushObject(tag);
              this.set('haveTagsSelected', true);
              setTimeout(() => {
                this.$(`.search-tag-input`).search("set value", "");
              }, 1)
            });
        } else {
          this.store.createRecord('tag', {
            title: value
          }).save()
            .then((tag) => {
              selectedTags.pushObject(tag);
              this.set('haveTagsSelected', true);
              setTimeout(() => {
                this.$(`.search-tag-input`).search("set value", "");
              }, 1)
            });
        }

      } else {

        return this.get('store').findRecord('tag', item.id)
          .then((tag) => {
            if (selectedTags.indexOf(tag) === -1) {
              selectedTags.pushObject(tag);
              this.set('haveTagsSelected', true);
            }
            setTimeout(() => {
              this.$(`.search-tag-input`).search("set value", "");
            }, 1)
          });
      }
    },
    unselectTag(id) {
      const selectedTags = this.get('selectedTags');
      selectedTags.forEach((tag) => {
        if (tag.id === id) {
          selectedTags.removeObject(tag)
        }
      });
      if (isEmpty(selectedTags)) {
        this.set('haveTagsSelected', false)
      }
    },
    saveTutorial(item, tutorials) {
      this.get("application").send("isLoading");
      let isFavorite = this.get('isFavorite');
      const selectedTags = this.get('selectedTags');
      const date = new Date();
      item.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      item.crush = isFavorite ? 'yes' : "";
      item.tags = selectedTags;
      this.store.createRecord('tutorial', item).save()

        .then((tutorial) => {
          tutorials.pushObject(tutorial);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Tutoriel créé", true);
          this.set('item', {});
          this.set('selectedTags', []);
        })
        .catch((error) => {
          console.error(error);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Erreur lors de la création du tutoriel", true);
        })
    },
    toCrush() {
      let isFavorite = !this.get('isFavorite');
      this.set('isFavorite', isFavorite);
    }

  }
});
