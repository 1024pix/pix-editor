import UiModal from 'semantic-ui-ember/components/ui-modal';
import $ from 'jquery';
import {computed} from '@ember/object';
import { oneWay } from '@ember/object/computed';
import DS from 'ember-data';

export default UiModal.extend({
  areas:null,
  classNameBindings: ['class'],
  competenceName:oneWay('competence.name'),
  tubeName:oneWay('tube.name'),
  selectedLevel:oneWay('level'),
  selectTubeLevel:false,
  willInitSemantic(settings) {
    this._super(...arguments);
    // remove any previously created modal with same class name
    $(`.${this.get('class')}`).remove();
    settings.detachable = true;
  },
  competences:computed('areas', function() {
    let areas = this.get('areas');
    if (!areas) {
      return Promise.resolve([]);
    }
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
  selectedCompetence:computed('competenceName', function() {
    return DS.PromiseObject.create({
      promise:this.get('competences')
      .then(competences => competences.find(competence => competence.get('name') === this.get('competenceName')))
    });
  }),
  tubes:computed('selectedCompetence', function() {
    return DS.PromiseArray.create({
      promise:this.get('selectedCompetence')
      .then(competence => competence.get('sortedTubes'))
    });
  }),
  tubesNames:computed('tubes', function() {
    return DS.PromiseArray.create({
      promise:this.get('tubes')
      .then(tubes => tubes.map(tube=>tube.get('name')))
    })
  }),
  selectedTube:computed('tubes', 'tubeName', function() {
    return DS.PromiseObject.create({
      promise:this.get('tubes')
      .then(tubes => tubes.find(tube => tube.get('name') === this.get('tubeName')))
    });
  }),
  levels:computed('selectedTube', function() {
    return DS.PromiseArray.create({
      promise:this.get('selectedTube')
      .then(tube => tube?tube.get('filledSkills'):[])
      .then(skills => skills.reduce((table, skill, index) => {
        if (skill === false) {
          table.push(index+1);
        }
        return table;
      }, []))
    });
  }),
  actions: {
    set() {
      if (this.get('selectTubeLevel')) {
        return this.get('selectedCompetence')
        .then(competence => {
          return this.get('selectedTube')
          .then(tube => {
            this.get('onChange')(competence, tube, this.get('selectedLevel'));
            this.execute('hide');
          });
        });
      } else {
        return this.get('selectedCompetence')
        .then(competence => {
          this.get('onChange')(competence);
          this.execute('hide');
        });
      }
    }
  }
});
