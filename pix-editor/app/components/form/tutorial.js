import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TutorialForm extends Component {

  @service store;
  @service idGenerator;

  options =  {
    'language': ['fr-fr', 'en-us'],
    'format': ['audio', 'frise', 'image', 'jeu', 'outil', 'page', 'pdf', 'site', 'slide', 'son', 'vidéo'],
    'level': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    'license': ['CC-BY-SA', '(c)', 'Youtube']
  };

  get hasSelectedTag() {
    return this.selectedTags.length>0
  }

  @action
  getSearchTagsResults(query) {
    const queryLowerCase = query.toLowerCase();
    return this.store.query('tag', {
      filterByFormula: `FIND('${queryLowerCase}', LOWER(Nom))`,
      maxRecords: 4,
      sort: [{field: 'Nom', direction: 'asc'}]
    })
      .then((tags) => {
        const results = tags.map(tag => ({title: tag.get('title'), id: tag.get('id')}));
        results.push({title: 'Ajouter', description: 'Créer un tag[note]', id: 'create'});
       return results
      })
  }

  @action
  selectTag(item) {
    const tutorial = this.args.tutorial;
    if (item.id === 'create') {
      const value = document.querySelector(`.tutorial-search .ember-power-select-search-input`).value;
      if (value.indexOf('[') !== -1) {
        const pos = value.indexOf('[');
        const length = value.length;
        const title = value.slice(0, pos);
        const notes = value.slice(pos + 1, length - 1);
        this.store.createRecord('tag', {
          title:title,
          notes:notes,
          pixId:this.idGenerator.newId()
        }).save()
          .then((tag) => {
            tutorial.tags.pushObject(tag);
          });
      } else {
        this.store.createRecord('tag', {
          title: value
        }).save()
          .then((tag) => {
            tutorial.tags.pushObject(tag);
          });
      }
    } else {
      return this.store.findRecord('tag', item.id)
        .then((tag) => {
          if (tutorial.tags.indexOf(tag) === -1) {
            tutorial.tags.pushObject(tag);
          }
        });
    }
  }

  @action
  unselectTag(id) {
    const tutorial = this.args.tutorial;
    tutorial.tags.forEach((tag) => {
      if (tag.id === id) {
        tutorial.tags.removeObject(tag)
      }
    });
  }

  @action
  toggleCrush() {
    this.args.tutorial.crush = !this.args.tutorial.crush;
  }
}
