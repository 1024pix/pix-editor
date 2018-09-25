import DS from 'ember-data';
import {sort} from '@ember/object/computed';

export default DS.Model.extend({
  name: DS.attr(),
  competences: DS.hasMany('competence'),
  competencesSorting: Object.freeze(['code']),
  sortedCompetences: sort('competences','competencesSorting')
});
