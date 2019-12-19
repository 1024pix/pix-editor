import Component from '@ember/component';

export default Component.extend({
  displayTutorialForm:false,
  init() {
    this._super(...arguments);
    this.options = {
      'clueStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé", "inapplicable"],
      'descriptionStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé"],
      'i18n': ["France", "Monde", "Union Européenne"]
    };
    this.set('tutorials', []);
    this.set('searchTitle', '');
    // this.set('popinCreateTuto', "popin-create-tuto");
  },
  actions:{
    openCreateTutorialModal(tutorials,title){
      this.set('searchTitle', title);
      this.set('tutorials',tutorials);
      this.set('displayTutorialForm', true)
    }
  }
});
