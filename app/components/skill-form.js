import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.options = {
      'status': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé"]
    }

  }
});
