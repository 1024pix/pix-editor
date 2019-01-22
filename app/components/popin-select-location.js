import UiModal from 'semantic-ui-ember/components/ui-modal';
import $ from 'jquery';
import {computed} from '@ember/object';
import { oneWay } from '@ember/object/computed';
import DS from 'ember-data';

export default UiModal.extend({
  classNameBindings: ['class'],
  competenceName:oneWay('competence.name'),
  willInitSemantic(settings) {
    this._super(...arguments);
    // remove any previously created modal with same class name
    $(`.${this.get('class')}`).remove();
    settings.detachable = true;
  },
  competences:computed('areas', function() {
    let areas = this.get('areas');
    let getCompetences = areas.reduce((requests, area) => {
      requests.push(area.get('sortedCompetences'));
      return requests;
    }, []);
    return DS.PromiseArray.create({
      promise:Promise.all(getCompetences)
      .then(areaCompetences => {
        return areaCompetences.reduce((table, competences) => {
          return table.concat(competences);
        }, []);
      })
    })
  }),
  competencesNames:computed('competences', function() {
    return DS.PromiseArray.create({
      promise:this.get('competences')
      .then(competences => competences.map(competence => competence.get('name')))
    });
  }),
  actions: {
    set() {
      let name = this.get('competenceName');
      return this.get('competences')
      .then(competences => competences.find(competence => { return competence.get('name') === name;}))
      .then(competence => {
        this.get('onChange')(competence);
        this.execute('hide');
      })
    }
  }
});
