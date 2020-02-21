import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import {computed,action} from '@ember/object';
import {oneWay} from '@ember/object/computed';
import DS from 'ember-data';

@classic
export default class PopinSelectLocation extends Component {

  title = null;
  areas = null;
  selectEmptyLevels = false;
  selectTubeLevel = false;
  multipleLevel = false;

  @oneWay('competence.name')
  competenceName;

  @oneWay('tube.name')
  tubeName;

  @oneWay('level')
  selectedLevel;

  @computed('areas')
  get competences() {
    const areas = this.get('areas');
    if (!areas) {
      return [];
    }
    const areaCompetences = areas.map(area => area.get('sortedCompetences'));
    return areaCompetences.reduce((table, competences) => {
      return table.concat(competences);
    }, []);
  }

  @computed('competences')
  get competencesNames() {
    return this.get('competences').map(competence => competence.get('name'));
  }

  @computed('competenceName')
  get selectedCompetence() {
    return this.get('competences').find(competence => competence.get('name') === this.get('competenceName'));
  }

  @computed('selectedCompetence')
  get tubes() {
    const selectedCompetence = this.get('selectedCompetence');
    return DS.PromiseArray.create({
      promise: selectedCompetence.get('rawTubes')
        .then(() => selectedCompetence.get('sortedTubes'))
    });
  }

  @computed('tubes')
  get tubesNames() {
    return DS.PromiseArray.create({
      promise: this.get('tubes')
        .then(tubes => tubes.map(tube => tube.get('name')))
    })
  }

  @computed('tubes', 'tubeName')
  get selectedTube() {
    return DS.PromiseObject.create({
      promise: this.get('tubes')
        .then(tubes => tubes.find(tube => tube.get('name') === this.get('tubeName')))
    });
  }

  @computed('selectedTube')
  get levels() {
    let selectEmptyLevels = this.get('selectEmptyLevels');
    let selectedTube;
    return DS.PromiseArray.create({
      promise: this.get('selectedTube')
        .then(tube => {
          selectedTube = tube;
          return tube ? tube.get('rawSkills') : null;
        })
        .then(result => {
          if (result == null) {
            return [];
          }
          const skills = selectedTube.get('filledSkills');
          return skills.reduce((table, skill, index) => {
            if (skill === false) {
              if (selectEmptyLevels) {
                table.push(index + 1);
              }
            } else if (!selectEmptyLevels) {
              table.push(index + 1);
            }
            return table;
          }, []);
        })
    });
  }

  @action
  setLocation() {
    if (this.get('selectTubeLevel')) {
      if (this.get('selectEmptyLevels')) {
        const competence = this.get('selectedCompetence');
        return this.get('selectedTube')
          .then(tube => {
            this.get('onChange')(competence, tube, this.get('selectedLevel'));
            this.set('display', false);
          });
      } else {
        let levels;
        if (this.get('multipleLevel')) {
          levels = this.get('selectedLevel');
        } else {
          levels = [this.get('selectedLevel')];
        }
        return this.get('selectedTube')
          .then(tube => tube.get('filledSkills'))
          .then(skills => {
            let selectedSkills = levels.map(level => {
              return skills[level - 1];
            });
            this.get('onChange')(selectedSkills);
            this.set('display', false);
          });
      }
    } else {
      const competence = this.get('selectedCompetence');
      this.get('onChange')(competence);
      this.set('display', false);
    }
  }

  @action
  closeModal() {
    this.set('display', false);
  }
}
