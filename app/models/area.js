import DS from 'ember-data';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.competences = [];
  },
  name: DS.attr(),
  competenceIds: DS.attr()
});
