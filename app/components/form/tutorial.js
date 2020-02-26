import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
export default class TutorialForm extends Component {
  isFavorite = false;
  edition = true;
  tutorial = null;

  @computed('selectedTags.[]')
  get hasSelectedTag() {
    const selectedTags = this.get('selectedTags');
    return selectedTags.length>0
  }

  @service
  store;

  init() {
    super.init(...arguments);
    this.options =  {
      'format': ['audio', 'frise', 'image', 'jeu', 'outil', 'page', 'pdf', 'site', 'slide', 'son', 'vidéo'],
      'level': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      'license': ['CC-BY-SA', '(c)', 'Youtube']
    };
    this.set('selectedTags', []);
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.set('selectedTags', []);
    this.set('tutorial', this.store.createRecord('tutorial'));
  }

  @computed('defaultTitle', 'tutorial.title')
  get title() {
    return this.get('tutorial.title')?this.get('tutorial.title'):this.get('defaultTitle');
  }

  set title(value) {
    this.set('tutorial.title', value);
    return value;
  }

  @action
  getSearchTagsResults(query) {
    const queryLowerCase = query.toLowerCase();
    return this.get('store').query('tag', {
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
    const selectedTags = this.get('selectedTags');
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
      return this.get('store').findRecord('tag', item.id)
        .then((tag) => {
          if (selectedTags.indexOf(tag) === -1) {
            selectedTags.pushObject(tag);
          }
        });
    }
  }

  @action
  unselectTag(id) {
    const selectedTags = this.get('selectedTags');
    selectedTags.forEach((tag) => {
      if (tag.id === id) {
        selectedTags.removeObject(tag)
      }
    });
  }

  @action
  saveTutorial(tutorials) {
    this.get('application').send('isLoading');
    let isFavorite = this.get('isFavorite');
    const selectedTags = this.get('selectedTags');
    const date = new Date();
    let item = this.get('tutorial');
    if (!item.get('title')) {
      item.set('title', this.get('defaultTitle'));
    }
    item.set('date', `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
    item.set('crush', isFavorite ? 'yes' : '');
    item.set('tags', selectedTags);
    item.save()
      .then((tutorial) => {
        tutorials.pushObject(tutorial);
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Tutoriel créé', true);
        this.set('display', false);
      })
      .catch((error) => {
        console.error(error);
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Erreur lors de la création du tutoriel', true);
      })
  }

  @action
  toCrush() {
    this.toggleProperty('isFavorite');
  }

  @action
  closeModal() {
    this.set('display', false);
  }
}
