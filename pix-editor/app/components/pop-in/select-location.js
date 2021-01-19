import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

export default class PopinSelectLocation extends Component {

  //todo refacto element loading
  @tracked _selectedCompetence = null;
  @tracked _selectedTube = null;
  @tracked _selectedSource = null;
  @tracked _selectedSkill = null;
  @tracked tubesLoaded = false;
  @tracked levelsLoaded = false;
  @tracked skillsLoaded = false;
  @tracked selectedLevels = null;

  @service currentData;

  _tubes = A([]);
  _skills = A([]);
  _levels = A([]);

  get sources() {
    return this.currentData.getSources();
  }

  get selectedSource() {
    if (this._selectedSource) {
      return this._selectedSource;
    }
    return this.currentData.getSource();
  }

  set selectedSource(value) {
    this._selectedSource = value;
    return value;
  }

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
    const areas = this.currentData.getAreas(false);
    const areaCompetences = areas.filter(area => area.source === this.selectedSource).map(area => area.sortedCompetences);
    return areaCompetences.reduce((table, competences) => {
      return table.concat(competences);
    }, []);
  }

  get competenceList() {
    return this.competences.map(competence => ({
      label: competence.name,
      data: competence
    }));
  }

  get tubes() {
    if (!this.tubesLoaded) {
      this._loadTubes().then(() => this._tubes);
    }
    return this._tubes;
  }

  get tubeList() {
    if (!this.tubesLoaded) {
      this._loadTubes();
      return A([]);
    } else {
      return this.tubes.map(tube => ({
        label: tube.name,
        data: tube
      }));
    }
  }

  _loadTubes() {
    if (this.selectedCompetence) {
      const competence = this.selectedCompetence.data;
      competence.rawTubes
        .then(() => {
          this._tubes = competence.sortedTubes;
          this.tubesLoaded = true;
        });
    }
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
        });
    }
    return this._levels;
  }

  get skills() {
    if (!this.skillsLoaded) {
      this._loadSkills().then(() => this._skills);
    }
    return this._skills;
  }

  get skillsGroupByLevelList() {
    if (!this.skillsLoaded) {
      this._loadSkills();
      return A([]);
    }
    return this.skills.map(skills=>this._buildGroupOption(skills[0].level, skills));
  }

  _loadSkills() {
    if (this.selectedTube) {
      const selectedTube = this.selectedTube.data;
      return selectedTube.rawSkills
        .then(()=>{
          this._skills = selectedTube.filledLiveSkills.filter(liveSkill=>{return liveSkill;});
          this.skillsLoaded = true;
        });
    }
  }

  _buildGroupOption(level, skills) {
    return {
      groupName: `Niveau ${level}`,
      options: skills
    };
  }

  get enableMoveActionButton() {
    if (this.args.isPrototypeLocation) {
      return (this.skillsLoaded && !!this._selectedSkill);
    }
    if (this.args.isSkillLocation) {
      return (this.levelsLoaded && !!this.selectedLevels);
    }
    return true;
  }

  @action
  selectSource(source) {
    this.selectedSource = source;
    this.selectCompetence(null);
  }

  @action
  selectCompetence(item) {
    this.selectedCompetence = item;
    this.selectTube(null);
    this.tubesLoaded = false;
  }

  @action
  selectTube(item) {
    this.selectedTube = item;
    this.selectLevels(null);
    this.levelsLoaded = false;
    this.selectedLevels = null;
    this.skillsLoaded = false;
    this._selectedSkill = null;
  }

  @action
  selectLevels(levels) {
    this.selectedLevels = levels;
  }

  get selectedSKill() {
    if (this._selectedSkill) {
      return this._selectedSkill;
    }
    let result = false;
    this.skillsGroupByLevelList.find(groupOptions=>{
      if (groupOptions) {
        result = groupOptions.options.find(skill=> {
          return skill.id === this.args.skill.id;
        });
        return !!result;
      }
    });
    return result;
  }

  @action
  selectSkill(value) {
    this._selectedSkill = value;
    return value;
  }

  @action
  setLocation() {
    const competence = this.selectedCompetence.data;
    const tube = this.selectedTube.data;
    if (!this.args.selectTubeLevel) {
      this.args.onChange(competence);
    }
    if (this.args.isPrototypeLocation) {
      this.args.onChange([this._selectedSkill]);
    }
    if (this.args.isSkillLocation) {
      this.args.onChange(competence, tube, this.selectedLevels);
    }
    this.args.close();
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
    this._selectedSkill = null;
    this.selectedLevels = null;
    this.tubesLoaded = false;
    this.levelsLoaded = false;
    this.skillsLoaded = false;
    this._tubes = A([]);
    this._levels = A([]);
    this._skills = A([]);
  }
}
