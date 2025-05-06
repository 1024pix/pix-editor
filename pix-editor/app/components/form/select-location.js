import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SelectLocation extends Component {

  //todo refacto element loading
  @tracked _selectedCompetence = null;
  @tracked _selectedTube = null;
  @tracked _selectedFramework = null;
  @tracked _selectedSkill = null;
  @tracked _selectedTheme = null;
  @tracked themesLoaded = false;
  @tracked tubesLoaded = false;
  @tracked areSkillsLoaded = false;
  @tracked selectedLevel = null;

  @service currentData;

  selectLevelOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
  ];

  _themes = A([]);
  _tubes = A([]);
  _skills = A([]);

  get frameworks() {
    return this.currentData.getFrameworks();
  }

  get selectedFramework() {
    if (this._selectedFramework) {
      return this._selectedFramework;
    }
    const currentFramework = this.currentData.getFramework();
    return this.frameworkList.find((framework) => framework.value === currentFramework.id);
  }

  get frameworkList() {
    return this.frameworks.map((framework) => ({
      label: framework.name,
      value: framework.id,
    }));
  }

  get selectedCompetence() {
    if (this._selectedCompetence) {
      return this._selectedCompetence;
    }

    const currentCompetence = this.currentData.getCompetence();
    return this.competenceList.find((competence) => competence.value === currentCompetence.id);
  }

  get competences() {
    const framework = this.frameworks.find((framework) => framework.id === this.selectedFramework.value);
    const areas = framework?.hasMany('areas').value() ?? [];
    const areaCompetences = areas.map((area) => area.sortedCompetences);
    return areaCompetences.reduce((table, competences) => {
      return table.concat(competences);
    }, []);
  }

  get competenceList() {
    return this.competences.map((competence) => ({
      label: competence.name,
      value: competence.id,
    }));
  }

  get selectedTheme() {
    if (this._selectedTheme) {
      return this._selectedTheme;
    }
    return this.themeList.find((item) => (item.value === this.args.theme.id));
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
      return this.themes.map((theme) => ({ label: theme.name, value: theme.id }));
    }
  }

  _loadThemes() {
    if (this.selectedCompetence.value) {
      const competence = this.competences.find((comp) => comp.id === this.selectedCompetence.value);
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
      return this.tubes.map((tube) => ({
        label: tube.name,
        value: tube.id,
      }));
    }
  }

  _loadTubes() {
    if (this.selectedCompetence) {
      const competence = this.competences.find((comp) => comp.id === this.selectedCompetence.value);
      competence.rawTubes
        .then(() => {
          this._tubes = competence.sortedTubes;
          this.tubesLoaded = true;
        });
    }
  }

  get selectedTube() {
    if (this._selectedTube) {
      return this._selectedTube.value;
    }

    const currentTube = this.tubeList.find((tube) => tube.value === this.args.tube?.id);
    return currentTube?.value;
  }

  get skillsByLevel() {
    if (!this.areSkillsLoaded) {
      this._loadSkills();
    }
    return this._skills;
  }

  get skillsListWithCategory() {
    if (!this.areSkillsLoaded) {
      this._loadSkills();
      return A([]);
    }
    return this.skillsByLevel.flat().map((skill) => ({
      category: `Niveau ${skill.level}`,
      label: `${skill.name} (v.${skill.version}) ${skill.status === 'actif' ? '🟢' : '🔵'}`,
      value: skill.id,
    }));
  }

  _loadSkills() {
    if (this._selectedTube) {
      const selectedTube = this.tubes.find((tube) => tube.id === this._selectedTube.value);
      return selectedTube.rawSkills.then(() => {
        this._skills = selectedTube.filledLiveSkills.filter((liveSkill) => liveSkill);
        this.areSkillsLoaded = true;
      });
    }
  }

  @action
  selectFramework(frameworkId) {
    this._selectedFramework = this.frameworkList.find((f) => f.value === frameworkId);
    this.selectCompetence(null);
  }

  @action
  selectCompetence(competenceId) {
    this._selectedCompetence = this.competenceList.find((f) => f.value === competenceId);
    this._selectedTube = null;
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
    this._selectedTube = this.tubeList.find((tube) => tube.value === item);
    this.selectLevel(null);
    this.selectedLevel = null;
    this.areSkillsLoaded = false;
    this._selectedSkill = null;
  }

  @action
  selectLevel(level) {
    this.selectedLevel = level;
  }

  get selectedSkill() {
    if (this._selectedSkill) {
      return this._selectedSkill;
    }
    return this.skillsListWithCategory.find((skill) => {
      return skill.id === this.args.skill.get('id');
    });
  }

  @action
  selectSkill(value) {
    this._selectedSkill = value;
    return value;
  }

  _reset() {
    this._selectedCompetence = null;
    this._selectedTube = null;
    this._selectedSkill = null;
    this.selectedLevel = null;
    this.tubesLoaded = false;
    this.areSkillLoaded = false;
    this._tubes = A([]);
    this._skills = A([]);
  }
}
