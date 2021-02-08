import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class TargetProfileController extends Controller {

  @tracked selectedTubeSkills = [];
  @tracked tubeSkills = [];
  @tracked selectedTube = null;
  @tracked selectedTubeLevel = false;
  @tracked showTubeDetails = false;
  @tracked isThematicResultMode = false;
  @tracked filter = false;
  @tracked displayTubeLevel = false;
  @tracked displayThematicResultTubeLevel = false;
  @tracked displaySingleEntry = false;
  @tracked displayThresholdCalculation = false;
  @tracked _selectedSources = null;
  @tracked singleEntryPopInTitle = null;
  @tracked singleEntryPopInLabel = null;
  @tracked singleEntryPopInAction = null;
  @tracked clearTubeAction = null;
  @tracked setTubeAction = null;


  @service('file-saver') fileSaver;
  @service currentData;
  @service notify;

  get selectedTubeCount() {
    return this.areas.reduce((count, area) => {
      return count + area.selectedProductionTubeCount;
    }, 0);
  }

  get selectedThematicResultTubeCount() {
    return this.areas.reduce((count, area) => {
      return count + area.selectedThematicResultTubeCount;
    }, 0);
  }

  get tubeCount() {
    return this.areas.reduce((count, area) => {
      return count + area.productionTubeCount;
    }, 0);
  }

  get sources() {
    return this.currentData.getSources();
  }

  get selectedSources() {
    if (!this._selectedSources) {
      return [this.currentData.getSource()];
    }
    return this._selectedSources;
  }

  set selectedSources(value) {
    this._selectedSources = value;
    return value;
  }

  get areas() {
    return this.model.filter(area => this.selectedSources.includes(area.source));
  }

  @action
  selectSources(values) {
    this.selectedSources = values;
  }

  @action
  displayTube(tube) {
    this.selectedTube = tube;
    this.tubeSkills = tube.productionSkills;
    this.selectedTubeLevel = tube.selectedLevel;
    this.selectedTubeSkills = tube.selectedSkills;
    this.setTubeAction = this.setProfileTube;
    this.clearTubeAction = this.unsetProfileTube;
    this.displayTubeLevel = true;
  }

  @action
  displayThematicResultTube(tube) {
    this.selectedTube = tube;
    this.tubeSkills = this._getThematicTubeSkills(tube);
    this.selectedTubeLevel = tube.selectedThematicResultLevel;
    this.selectedTubeSkills = tube.selectedThematicResultSkills;
    this.setTubeAction = this.setThematicResultTube;
    this.clearTubeAction = this.unsetThematicResultTube;
    this.displayTubeLevel = true;
  }

  _getThematicTubeSkills(tube) {
    const productionSkill = tube.productionSkills;
    return productionSkill.filter(skill=>{
      return tube.selectedSkills.includes(skill.pixId);
    });
  }

  @action
  closeTubeLevel() {
    this.displayTubeLevel = false;
  }

  @action
  setProfileTube(tube, level, skills) {
    if (!level) {
      [skills, level] = this._getTubeSkillsAndMaxLevel(tube);
    }
    tube.selectedLevel = level;
    tube.selectedSkills = skills;
  }

  @action
  setThematicResultTube(tube, level, skills) {
    tube.selectedThematicResultLevel = level;
    tube.selectedThematicResultSkills = skills;
  }

  @action
  unsetProfileTube(tube) {
    tube.selectedLevel = false;
    tube.selectedSkills = [];
  }

  @action
  unsetThematicResultTube(tube) {
    tube.selectedThematicResultLevel = false;
    tube.selectedThematicResultSkills = [];
  }

  @action
  getGenerateTitleOrThematicResultTitle() {
    if (this.isThematicResultMode) {
      this._getGenerateThematicResultTitle();
    } else {
      this._getGenerateTitle();
    }
  }

  _getGenerateThematicResultTitle() {
    this.singleEntryPopInTitle = 'Enregistrer le résultat thématique';
    this.singleEntryPopInLabel = 'Nom du fichier';
    this.singleEntryPopInAction = this.generateThematicResult;
    this.displaySingleEntry = true;
  }

  _getGenerateTitle() {
    this.singleEntryPopInTitle = 'Enregistrer les identifiants du profil cible';
    this.singleEntryPopInLabel = 'Nom du fichier';
    this.singleEntryPopInAction = this.generate;
    this.displaySingleEntry = true;
  }

  @action
  generateThematicResult(title) {
    const ids = this._getSelectedSkillsIds();
    const fileTitle = title ? `${title}-RT` : 'Résultat_thématique';
    const fileName = `${fileTitle}_${(new Date()).toLocaleString('fr-FR')}.txt`;
    this.fileSaver.saveAs(ids.join(','), fileName);
  }

  @action
  generate(title) {
    const ids = this._getSelectedSkillsIds(true);
    const fileTitle = title ? title : 'profil_identifiants';
    const fileName = `${fileTitle}_${(new Date()).toLocaleString('fr-FR')}.txt`;
    this.fileSaver.saveAs(ids.join(','), fileName);
  }

  @action
  getSaveTitle() {
    this.singleEntryPopInTitle = 'Enregistrer le profil cible';
    this.singleEntryPopInLabel = 'Nom du fichier';
    this.singleEntryPopInAction = this.save;
    this.displaySingleEntry = true;
  }

  @action
  save(title) {
    const data = this.areas.reduce((areaValues, area) => {
      const competences = area.competences;
      return competences.reduce((competenceValues, competence) => {
        const tubes = competence.tubes;
        return tubes.reduce((tubeValues, tube) => {
          if (tube.selectedLevel) {
            tubeValues.push({
              id: tube.pixId,
              level: tube.selectedLevel,
              skills: tube.selectedSkills
            });
          }
          return tubeValues;
        }, competenceValues);
      }, areaValues);
    }, []);
    const fileTitle = title ? title : 'profil';
    const fileName = `${fileTitle}_${(new Date()).toLocaleString('fr-FR')}.json`;
    this.fileSaver.saveAs(JSON.stringify(data), fileName);
  }

  @action
  getProfileId() {
    this.singleEntryPopInTitle = 'Identifiant du profil cible';
    this.singleEntryPopInLabel = 'Identifiant';
    this.singleEntryPopInAction = this.generateSQL;
    this.displaySingleEntry = true;
  }

  @action
  closeSingleEntry() {
    this.displaySingleEntry = false;
  }

  @action
  generateSQL(profileId) {
    const ids = this._getSelectedSkillsIds(true);
    const sql = ids.reduce((content, id) => {
      return content + `\n${profileId},${id}`;
    }, 'targetProfileId,skillId');
    const fileName = `${profileId}_generate_profile_${(new Date()).toLocaleString('fr-FR')}.csv`;
    this.fileSaver.saveAs(sql, fileName);
  }

  @action
  load() {
    const fileInput = document.getElementById('target-profile__open-file');
    fileInput.click();
  }

  @action
  openFile(event) {
    try {
      const file = event.target.files[0];
      const reader = new FileReader();
      const areas = this.model;
      const that = this;
      reader.onload = (event) => {
        const data = event.target.result;
        const tubes = JSON.parse(data);
        const indexedTubes = tubes.reduce((values, tube) => {
          values[tube.id] = tube;
          return values;
        }, {});
        const sources = [];
        areas.forEach(area => {
          const competences = area.competences;
          competences.forEach(competence => {
            const tubes = competence.tubes;
            tubes.forEach(tube => {
              if (indexedTubes[tube.pixId]) {
                if (indexedTubes[tube.pixId].level === 'max') {
                  const [skills, level] = this._getTubeSkillsAndMaxLevel(tube);
                  tube.selectedLevel = level;
                  tube.selectedSkills = skills;
                } else {
                  tube.selectedLevel = indexedTubes[tube.pixId].level;
                  tube.selectedSkills = indexedTubes[tube.pixId].skills;
                }
                if (!sources.includes(competence.source)) {
                  sources.push(competence.source);
                }
              } else {
                tube.selectedLevel = false;
                tube.selectedSkills = [];
              }
            });
          });
        });
        that.selectedSources = sources;
        this.notify.message('Fichier correctement chargé');
        //TODO: find a better way to be able to reload same file
        document.getElementById('target-profile__open-file').value = '';
      };
      reader.readAsText(file);
    } catch (error) {
      this.notify.error('Erreur lors de l\'ouverture du fichier');
      Sentry.captureException(error);
    }
  }

  @action
  showTubeName(name, competence) {
    competence._tubeName = name;
  }

  @action
  hideTubeName(competence) {
    competence._tubeName = null;
  }

  @action
  toggleThematicResult(e) {
    if (e.target.checked) {
      this.filter = true;
      this.showTubeDetails = true;
    }
  }

  @action
  showThresholdCalculation() {
    this.displayThresholdCalculation = true;
  }

  @action
  closeThresholdCalculation() {
    this.displayThresholdCalculation = false;
  }

  _getTubeSkillsAndMaxLevel(tube) {
    const productionSkill = tube.productionSkills;
    const level = productionSkill[productionSkill.length - 1].level;
    const skills = productionSkill.reduce((ids, skill) => {
      if (skill) {
        ids.push(skill.pixId);
      }
      return ids;
    }, []);
    return [skills, level];
  }

  _getSelectedSkillsIds(fromProfileAction) {
    return this.areas.reduce((areaValues, area) => {
      const competences = area.competences;
      return competences.reduce((competenceValues, competence) => {
        const tubes = competence.tubes;
        return tubes.reduce((tubeValues, tube) => {
          if (fromProfileAction && tube.selectedLevel) {
            tubeValues = tubeValues.concat(tube.selectedSkills);
          }
          if (!fromProfileAction && tube.selectedThematicResultLevel) {
            tubeValues = tubeValues.concat(tube.selectedThematicResultSkills);
          }
          return tubeValues;
        }, competenceValues);
      }, areaValues);
    }, []);
  }
}
