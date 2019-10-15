import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.options = {
      'clueStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé", "inapplicable"],
      'descriptionStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé"]
    };
    this.set('tutorials', []);
    this.set('searchTitle', '');
    this.set('popinCreateTuto', "popin-create-tuto");
  },
  actions:{
    openCreateTutorialModal(tutorials,title){
      this.set('searchTitle', title);
      this.set('tutorials',tutorials);
      $(`.${this.get('popinCreateTuto')}`).modal('show');
    }
  }
});
