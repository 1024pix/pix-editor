import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SelectLocation extends Component {
  @service currentData;
  @tracked selectedFrameworkId;
  @tracked selectedCompetenceId;
  @tracked selectedThemeId;
  @tracked selectedTubeId;
  @tracked selectedSkillId;
  @tracked selectedLevel;
  @tracked areTubesLoaded;
  @tracked areSkillsLoaded;

  constructor(...args) {
    super(...args);

    const supportedVariants = ['prototype', 'skill', 'tube'];
    if (!supportedVariants.includes(this.args.variant)) {
      throw new Error(`[Form::SelectLocation] the @variant argument must be a valid option (${supportedVariants})`);
    }

    this.selectedFrameworkId = this.currentData.getFramework().id;
    this.selectedCompetenceId = this.currentData.getCompetence().id;
    this.selectedThemeId = this.args.theme?.id;
    this.selectedTubeId = this.args.tube?.id;
    this.selectedSkillId = this.args.skill?.id;
    this.areTubesLoaded = false;
    this.areSkillsLoaded = false;
    if (this.selectedCompetenceId) {
      this._loadTubes(this.selectedCompetenceId);
    }
  }

  get isMovingPrototype() {
    return this.args.variant === 'prototype';
  }

  get isMovingSkill() {
    return this.args.variant === 'skill';
  }

  get isMovingTube() {
    return this.args.variant === 'tube';
  }

  // == FRAMEWORKS

  get frameworkOptionList() {
    const frameworkList = this.currentData.getFrameworks();
    return frameworkList.map((framework) => ({ label: framework.name, value: framework.id }));
  }

  @action
  selectFramework(frameworkId) {
    this.selectedFrameworkId = frameworkId;
    this.selectCompetence(null);
  }

  // == COMPETENCES

  get competenceList() {
    const frameworkList = this.currentData.getFrameworks();
    const currentFramework = frameworkList.find((framework) => framework.id === this.selectedFrameworkId);
    const areas = currentFramework?.hasMany('areas').value() ?? [];
    return areas.flatMap((area) => area.sortedCompetences);
  }

  get competenceOptionList() {
    return this.competenceList.map((competence) => ({ label: competence.name, value: competence.id }));
  }

  @action
  selectCompetence(competenceId) {
    this.selectedCompetenceId = competenceId;
    this.selectTheme(null);
    this.selectTube(null);
    if (competenceId) this._loadTubes(competenceId);
  }

  // == THEMES

  get themeList() {
    const currentCompetence = this.competenceList.find((competence) => competence.id === this.selectedCompetenceId);
    if (!currentCompetence) return null;

    const themeRelationship = currentCompetence.hasMany('rawThemes');
    if (!themeRelationship.value()) {
      themeRelationship.load();
      return null;
    }

    return currentCompetence.sortedThemes;
  }

  get areThemesLoaded() {
    return this.themeList !== null;
  }

  get themeOptionList() {
    return this.themeList.map((theme) => ({ label: theme.name, value: theme.id }));
  }

  @action
  selectTheme(themeId) {
    this.selectedThemeId = themeId;
  }

  // == TUBES

  get tubeList() {
    const currentCompetence = this.competenceList.find((competence) => competence.id === this.selectedCompetenceId);
    if (!currentCompetence) return null;

    if (!this.areTubesLoaded) {
      return null;
    }

    return currentCompetence.sortedTubes;
  }

  get tubeOptionList() {
    return this.tubeList.map((tube) => ({ label: tube.name, value: tube.id }));
  }

  _loadTubes(competenceId) {
    const currentCompetence = this.competenceList.find((competence) => competence.id === competenceId);
    currentCompetence.hasMany('rawTubes').load().then(() => {
      this.areTubesLoaded = true;

      if (this.selectedTubeId) {
        this._loadSkills(this.selectedTubeId);
      }
    });
  }

  @action
  selectTube(tubeId) {
    this.selectedTubeId = tubeId;
    this.selectSkill(null);
    if (tubeId) this._loadSkills(tubeId);
  }

  // == SKILLS

  get skillListWithCategory() {
    if (!this.tubeList) return null;
    const currentTube = this.tubeList.find((tube) => tube.id === this.selectedTubeId);
    if (!currentTube) return null;
    if (!this.areSkillsLoaded) return null;

    // ASK JEREM WTF
    return currentTube.filledLiveSkills.filter((liveSkill) => liveSkill).flat();
  }

  get skillOptionListWithCategory() {
    return this.skillListWithCategory.map((skill) => ({
      category: `Niveau ${skill.level}`,
      label: `${skill.name} (v.${skill.version}) ${skill.status === 'actif' ? '🟢' : '🔵'}`,
      value: skill.id,
    }));
  }

  _loadSkills(tubeId) {
    const currentTube = this.tubeList.find((tube) => tube.id === tubeId);
    currentTube.hasMany('rawSkills').load().then(() => this.areSkillsLoaded = true);
  }

  @action
  selectSkill(skillId) {
    this.selectedSkillId = skillId;
    this.selectLevel(null);
  }

  // == LEVEL

  get levelOptionList() {
    return [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
      { value: 6, label: '6' },
      { value: 7, label: '7' },
      { value: 8, label: '8' },
    ];
  }

  @action
  selectLevel(level) {
    this.selectedLevel = level;
  }
}
