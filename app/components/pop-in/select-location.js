import Component from '@glimmer/component';
import {action} from '@ember/object';
import DS from 'ember-data';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class PopinSelectLocation extends Component {

  @tracked _selectedCompetence = null;
  @tracked _selectedTube = null;
  @tracked tubesLoaded = false;
  @tracked levelsLoaded = false;

  _tubes = A([]);
  _levels = [];

  get selectedCompetence() {
    if (this._selectedCompetence) {
      return this._selectedCompetence;
    }
    return this.competenceList.find(item => (item.data == this.args.competence));
  }

  set selectedCompetence(value) {
    this._selectedCompetence = value;
    return value;
  }

  get competences() {
    const areas = this.args.areas;
    const areaCompetences = areas.map(area => area.sortedCompetences);
    return areaCompetences.reduce((table, competences) => {
      return table.concat(competences);
    }, []);
  }

  get competenceList() {
    return this.competences.map(competence => ({
      label:competence.get('name'),
      data:competence
    }));
  }

  get tubes() {
    if (!this.tubesLoaded) {
      this._loadTubes();
    }
    return this._tubes;
  }

  get tubeList() {
    if (!this.tubesLoaded) {
      this._loadTubes();
      return A([]);
    } else {
      console.log('loaded');
      return this.tubes.map(tube => ({
        label:tube.name,
        data:tube
      }))
    }
  }

  _loadTubes() {
    const competence = this.selectedCompetence.data;
    console.log('ici');
    competence.get('rawTubes')
    .then(() => {
      console.log('raw tubes loaded');
      this._tubes = competence.get('sortedTubes');
      this.tubesLoaded = true;
    });
  }

  get selectedTube() {
    if (this._selectedTube) {
      return this._selectedTube;
    }
    console.debug(this.tubeList, this.tubeList.find(item => (item.data == this.args.tube)));
    return this.tubeList.find(item => (item.data == this.args.tube));
  }

  set selectedTube(value) {
    this._selectedTube = value;
    return value;
  }

  get levels() {
    if (!this.levelsLoaded && this.tubesLoaded) {
      const selectedTube = this.selectedTube.data;
      return selectedTube.rawSkills
      .then(() => {
        const skills = selectedTube.filledSkills;
        const selectEmptyLevels = this.args.selectEmptyLevels;
        this._levels = skills.reduce((table, skill, index) => {
          if (skill === false) {
            if (selectEmptyLevels) {
              table.push(index + 1);
            }
          } else if (!selectEmptyLevels) {
            table.push(index + 1);
          }
          return table;
        }, []);
        this.levelsLoaded = true;
      })
    }
    return this._levels;
  }

  @action
  selectCompetence(item) {
    this.selectedCompetence = item;
    this.tubesLoaded = false;
    this.levelsLoaded = false;
  }

  @action
  selectTube(item) {
    this.selectedTube = item;
    this.levelsLoaded = false;
  }

  @action
  selectLevels(levels) {
    console.debug(levels);
    this.selectedLevels = levels;
  }

  @action
  setLocation() {
    this.args.close();
    const competence = this.selectedCompetence.data;
    if (this.args.selectTubeLevel) {
      if (this.args.selectEmptyLevels) {
        return this.get('selectedTube')
          .then(tube => {
            this.get('onChange')(competence, tube, this.get('selectedLevel'));
            this._reset();
          });
      } else {
        let levels;
        if (this.args.multipleLevel) {
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
            this._reset();
          });
      }
    } else {
      this.get('onChange')(competence);
      this._reset();
    }
  }

  @action
  closeModal() {
    this._reset();
    this.args.close();
  }

  _reset() {
    this._selectedCompetence = null;
    this._selectedTube = null;
    this.tubesLoaded = false;
    this.levelsLoaded = false;
    this._tubes = A([]);
    this._levels = A([]);
  }
}
