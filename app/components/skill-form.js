import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.options = {
      'clueStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé", "inapplicable"],
      'descriptionStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé"]
    }

  }
});
