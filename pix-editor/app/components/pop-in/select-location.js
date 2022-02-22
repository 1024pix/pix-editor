import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

export default class PopinSelectLocation extends Component {

  //todo refacto element loading
  @tracked _selectedCompetence = null;
  @tracked _selectedTube = null;
  @tracked _selectedFramework = null;
  @tracked _selectedSkill = null;
  @tracked _selectedTheme = null;
  @tracked themesLoaded = false;
  @tracked tubesLoaded = false;
  @tracked skillsLoaded = false;
  @tracked selectedLevel = null;

  @service currentData;

  selectLevelOptions = [1,2,3,4,5,6,7,8];

  _themes = A([]);
  _tubes = A([]);
  _skills = A([]);

  get titleModal() {
    if (this.args.title) {
      return this.args.title;
    }
    return `Emplacement de ${this.args.name}`;
  }

  get frameworks() {
    return this.currentData.getFrameworks();
  }

  get selectedFramework() {
    if (this._selectedFramework) {
      return this._selectedFramework;
    }
    return this.frameworkList.find(item => (item.data === this.currentData.getFramework()));
  }

  set selectedFramework(value) {
    this._selectedFramework = value;
    return value;
  }

  get frameworkList() {
    return this.frameworks.map(framework => ({
      label: framework.name,
      data: framework
    }));
  }

  get selectedCompetence() {
    if (this._selectedCompetence) {
      return this._selectedCompetence;
    }
    return this.competenceList.find(item => (item.data === this.currentData.getCompetence()));
  }

  set selectedCompetence(value) {
    this._selectedCompetence = value;
    return value;
  }

  get competences() {
    const framework = this.selectedFramework.data;
    const areas = framework.areas;
    const areaCompetences = areas.map(area => area.sortedCompetences);
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

  get selectedTheme() {
    if (this._selectedTheme) {
      return this._selectedTheme;
    }
    return this.themeList.find(item => (item.data === this.args.theme.content));

  }

  get themes() {
    if (!this.themesLoaded) {
      this._loadThemes().then(() => this._themes);
    }
    return this._themes;
  }

  get themeList() {
    if (!this.themesLoaded) {
      this._loadThemes();
      return A([]);
    } else {
      return this.themes.map(theme => ({
        label: theme.name,
        data: theme
      }));
    }
  }

  _loadThemes() {
    if (this.selectedCompetence) {
      const competence = this.selectedCompetence.data;
      competence.rawThemes
        .then(() => {
          this._themes = competence.sortedThemes;
          this.themesLoaded = true;
        });
    }
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

  get titleButtonAction() {
    if (this.args.isSkillLocation) {
      return 'Copier vers';
    }
    return 'Déplacer';
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
    if (this.args.isTubeLocation) {
      return this.themesLoaded && !!this._selectedTheme;
    }
    if (this.args.isPrototypeLocation) {
      return (this.skillsLoaded && !!this._selectedSkill);
    }
    if (this.args.isSkillLocation) {
      return !!this.selectedLevel;
    }
    return true;
  }

  @action
  selectFramework(source) {
    this.selectedFramework = source;
    this.selectCompetence(null);
  }

  @action
  selectCompetence(item) {
    this.selectedCompetence = item;
    this.selectTube(null);
    this.selectTheme(null);
    this.tubesLoaded = false;
    this.themesLoaded = false;
  }

  @action
  selectTheme(item) {
    this._selectedTheme = item;
  }

  @action
  selectTube(item) {
    this.selectedTube = item;
    this.selectLevel(null);
    this.selectedLevel = null;
    this.skillsLoaded = false;
    this._selectedSkill = null;
  }

  @action
  selectLevel(level) {
    this.selectedLevel = level;
  }

  get selectedSKill() {
    if (this._selectedSkill) {
      return this._selectedSkill;
    }
    let result = false;
    this.skillsGroupByLevelList.find(groupOptions=>{
      if (groupOptions) {
        result = groupOptions.options.find(skill=> {
          return skill.id === this.args.skill.get('id');
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
    if (this.args.isTubeLocation) {
      const theme = this._selectedTheme.data;
      this.args.onChange(competence, theme);
    }
    if (this.args.isPrototypeLocation) {
      this.args.onChange(this._selectedSkill);
    }
    if (this.args.isSkillLocation) {
      const tube = this.selectedTube.data;
      this.args.onChange(competence, tube, this.selectedLevel);
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
    this.selectedLevel = null;
    this.tubesLoaded = false;
    this.skillsLoaded = false;
    this._tubes = A([]);
    this._skills = A([]);
  }
}
