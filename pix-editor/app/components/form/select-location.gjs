import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { and, or } from 'ember-truth-helpers';

export default class FormSelectLocation extends Component {
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

    const supportedVariants = [
      'prototype',
      'skill',
      'tube',
    ];
    if (!supportedVariants.includes(this.args.variant)) {
      throw new Error(`[Form::SelectLocation] the @variant argument must be a valid option (${supportedVariants})`);
    }

    this.selectedFrameworkId = this.currentData.getFramework().id;
    this.selectedCompetenceId = this.currentData.getCompetence().id;
    this.areTubesLoaded = false;
    this.areSkillsLoaded = false;
    if (this.selectedCompetenceId) {
      this._loadTubes(this.selectedCompetenceId);
    }
    if (this.isMovingTube) { // theme
      if (!this.args.theme) {
        throw new Error('[Form::SelectLocation] @variant=`tube` requires @thematic argument');
      }
      this.selectedThemeId = this.args.theme.id;
    } else if (this.isMovingPrototype) { // tube and skill
      if (!this.args.tube || !this.args.skill) {
        throw new Error('[Form::SelectLocation] @variant=`prototype` requires @skill and @tube arguments');
      }
      this.selectedTubeId = this.args.tube?.id;
      this.selectedSkillId = this.args.skill?.id;
    } else if (this.isMovingSkill) { // tube only
      if (!this.args.tube) {
        throw new Error('[Form::SelectLocation] @variant=`skill` requires @tube argument');
      }
      this.selectedTubeId = this.args.tube?.id;
    }

    this.args.setIsSubmittable(false);
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
    const areas = currentFramework?.hasMany('areas').value();
    if (!areas) return null;
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
    this.areTubesLoaded = false;
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
    this.args.setIsSubmittable(!!themeId && themeId !== this.args.theme.id);
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
    this.areSkillsLoaded = false;
    if (tubeId) this._loadSkills(tubeId);
  }

  // == SKILLS

  get skillList() {
    if (!this.tubeList) return null;
    const currentTube = this.tubeList.find((tube) => tube.id === this.selectedTubeId);
    if (!currentTube) return null;
    if (!this.areSkillsLoaded) return null;

    return currentTube.filledLiveSkills.filter((liveSkill) => liveSkill).flat();
  }

  get skillOptionListWithCategory() {
    return this.skillList.map((skill) => ({
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
    if (this.isMovingPrototype) {
      this.args.setIsSubmittable(!!skillId && skillId !== this.args.skill.id);
    }
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
    if (this.isMovingSkill) {
      this.args.setIsSubmittable(!!level);
    }
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    const competence = this.competenceList.find((comp) => comp.id === this.selectedCompetenceId);
    if (this.isMovingTube) {
      const theme = this.themeList.find((theme) => theme.id === this.selectedThemeId);
      this.args.onSubmit(competence, theme);
    }
    if (this.isMovingPrototype) {
      const skill = this.skillList.find((skill) => skill.id === this.selectedSkillId);
      this.args.onSubmit(skill);
    }
    if (this.isMovingSkill) {
      const tube = this.tubeList.find((tube) => tube.id === this.selectedTubeId);
      this.args.onSubmit(competence, tube, this.selectedLevel);
    }
  }

  <template>
    <form
      action=""
      class="select-location"
      id="form-select-location"
      name="Sélectionner un emplacement"
      {{on "submit" this.onSubmit}}
    >
      <PixSelect
        @id="select-framework-location"
        @value={{this.selectedFrameworkId}}
        @options={{this.frameworkOptionList}}
        @onChange={{this.selectFramework}}
        @hideDefaultOption={{true}}
      >
        <:label>Référentiel</:label>
      </PixSelect>
      <PixSelect
        @id="select-competence-location"
        @value={{this.selectedCompetenceId}}
        @options={{this.competenceOptionList}}
        @onChange={{this.selectCompetence}}
        @hideDefaultOption={{true}}
        @placeholder="Sélectionner une compétence"
      >
        <:label>Compétence</:label>
      </PixSelect>
      {{#if (and this.isMovingTube this.selectedCompetenceId)}}
        {{#if this.areThemesLoaded}}
          <PixSelect
            @id="select-thematic-location"
            @value={{this.selectedThemeId}}
            @options={{this.themeOptionList}}
            @onChange={{this.selectTheme}}
            @hideDefaultOption={{true}}
            @placeholder="Sélectionner une thématique"
            @requiredLabel="Merci de sélectionner une thématique"
          >
            <:label>Thématique</:label>
          </PixSelect>
        {{else}}
          <p>Chargement des thématiques en cours...</p>
        {{/if}}
      {{/if}}
      {{#if (or this.isMovingPrototype this.isMovingSkill)}}
        {{#if this.selectedCompetenceId}}
          {{#if this.areTubesLoaded}}
            <PixSelect
              @id="select-tube-location"
              @value={{this.selectedTubeId}}
              @options={{this.tubeOptionList}}
              @onChange={{this.selectTube}}
              @hideDefaultOption={{true}}
              @placeholder="Sélectionner un sujet"
            >
              <:label>Sujet</:label>
            </PixSelect>
          {{else}}
            <p>Chargement des sujets en cours...</p>
          {{/if}}
        {{/if}}
        {{#if this.selectedTubeId}}
          {{#if this.isMovingPrototype}}
            {{#if this.areSkillsLoaded}}
              <PixSelect
                @id="select-skill-location"
                @value={{this.selectedSkillId}}
                @options={{this.skillOptionListWithCategory}}
                @onChange={{this.selectSkill}}
                @hideDefaultOption={{true}}
                @placeholder="Sélectionner un acquis"
              >
                <:label>Acquis</:label>
              </PixSelect>
            {{else}}
              <p>Chargement des acquis en cours...</p>
            {{/if}}
          {{else}}
            <PixSelect
              @id="select-level-location"
              @value={{this.selectedLevel}}
              @options={{this.levelOptionList}}
              @onChange={{this.selectLevel}}
              @hideDefaultOption={{true}}
              @placeholder="Sélectionner un niveau"
            >
              <:label>Niveau</:label>
            </PixSelect>
          {{/if}}
        {{/if}}
      {{/if}}
    </form>

  </template>
}
