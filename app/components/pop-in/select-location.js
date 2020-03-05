import Component from '@glimmer/component';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

export default class PopinSelectLocation extends Component {

  @tracked _selectedCompetence = null;
  @tracked _selectedTube = null;
  @tracked tubesLoaded = false;
  @tracked levelsLoaded = false;
  @tracked selectedLevels = null;

  @service currentData;

  _tubes = A([]);
  _levels = [];

  get selectedCompetence() {
    if (this._selectedCompetence) {
      return this._selectedCompetence;
    }
    return this.competenceList.find(item => (item.data == this.currentData.getCompetence()));
  }

  set selectedCompetence(value) {
    this._selectedCompetence = value;
    return value;
  }

  get competences() {
    const areas = this.currentData.getAreas();
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
      return this.tubes.map(tube => ({
        label:tube.name,
        data:tube
      }))
    }
  }

  _loadTubes() {
    const competence = this.selectedCompetence.data;
    competence.get('rawTubes')
    .then(() => {
      this._tubes = competence.get('sortedTubes');
      this.tubesLoaded = true;
    });
  }

  get selectedTube() {
    if (this._selectedTube) {
      return this._selectedTube;
    }
    return this.tubeList.find(item => (item.data == this.args.tube.content));
  }

  set selectedTube(value) {
    this._selectedTube = value;
    return value;
  }

  get levels() {
    if (!this.levelsLoaded && this.tubesLoaded && this.selectedTube) {
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
    this.selectedTube = null;
    this.tubesLoaded = false;
    this.levelsLoaded = false;
    this.selectedLevels = null;
  }

  @action
  selectTube(item) {
    this.selectedTube = item;
    this.levelsLoaded = false;
    this.selectedLevels = null;
  }

  @action
  selectLevels(levels) {
    this.selectedLevels = levels;
  }

  @action
  setLocation() {
    this.args.close();
    const competence = this.selectedCompetence.data;
    if (this.args.selectTubeLevel) {
      const tube = this.selectedTube.data;
      if (this.args.selectEmptyLevels) {
        this.args.onChange(competence, tube, this.selectedLevels);
      } else {
        let levels;
        if (this.args.multipleLevel) {
          levels = this.selectedLevels;
        } else {
          levels = [this.selectedLevels];
        }
        const tubeSkills = this.selectedTube.data.filledSkills;
        const selectedSkills = levels.map(level => {
          return tubeSkills[level-1];
        })
        this.args.onChange(selectedSkills);
      }
    } else {
      this.args.onChange(competence);
    }
    this._reset();
  }

  @action
  closeModal() {
    this._reset();
    this.args.close();
  }

  _reset() {
    this._selectedCompetence = null;
    this._selectedTube = null;
    this.selectedLevels = null;
    this.tubesLoaded = false;
    this.levelsLoaded = false;
    this._tubes = A([]);
    this._levels = A([]);
  }
}
