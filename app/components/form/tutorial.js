import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class TutorialForm extends Component {
  edition = true;

  options =  {
    'format': ['audio', 'frise', 'image', 'jeu', 'outil', 'page', 'pdf', 'site', 'slide', 'son', 'vidéo'],
    'level': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    'license': ['CC-BY-SA', '(c)', 'Youtube']
  };

  @tracked selectedTags = A([]);
  @tracked isFavorite = false;
  @tracked tutorial = {};
  @service store;

  get hasSelectedTag() {
    return this.selectedTags.length>0
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.selectedTags = A([]);
    this.tutorial = this.store.createRecord('tutorial');
  }

  get title() {
    return this.tutorial.title?this.tutorial.title:this.args.defaultTitle;
  }

  set title(value) {
    this.tutorial.title = value;
    return value;
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
    const selectedTags = this.selectedTags;
    if (item.id === 'create') {
      const value = document.querySelector(`.tutorial-search .ember-power-select-search-input`).value;
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
          });
      } else {
        this.store.createRecord('tag', {
          title: value
        }).save()
          .then((tag) => {
            selectedTags.pushObject(tag);
          });
      }
    } else {
      return this.store.findRecord('tag', item.id)
        .then((tag) => {
          if (selectedTags.indexOf(tag) === -1) {
            selectedTags.pushObject(tag);
          }
        });
    }
  }

  @action
  unselectTag(id) {
    const selectedTags = this.selectedTags;
    selectedTags.forEach((tag) => {
      if (tag.id === id) {
        selectedTags.removeObject(tag)
      }
    });
  }

  @action
  saveTutorial() {
    this.args.application.send('isLoading');
    let isFavorite = this.isFavorite;
    const selectedTags = this.selectedTags;
    const date = new Date();
    let item = this.tutorial;
    if (!item.title) {
      item.title = this.defaultTitle;
    }
    item.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    item.crush = isFavorite ? 'yes' : '';
    item.tags = selectedTags;
    console.debug(item)
    item.save()
      .then((tutorial) => {
        this.args.application.send('finishedLoading');
        this.args.application.send('showMessage', 'Tutoriel créé', true);
        this.args.addTutorial(tutorial);
        this.args.close();
      })
      .catch((error) => {
        console.error(error);
        this.args.application.send('finishedLoading');
        this.args.application.send('showMessage', 'Erreur lors de la création du tutoriel', true);
      })
  }

  @action
  toCrush() {
    this.isFavorite = !this.isFavorite;
  }
}
