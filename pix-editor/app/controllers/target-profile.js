import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class TargetProfileController extends Controller {

  @tracked selectedTubeSkills = [];
  @tracked selectedTube = null;
  @tracked selectedTubeLevel = false;
  @tracked showTubeDetails = false;
  @tracked filter = false;
  @tracked displayTubeLevel = false;
  @tracked displaySingleEntry = false;
  @tracked _selectedSources = null;

  @service('file-saver') fileSaver;
  @service currentData;
  @service notify;

  get selectedTubeCount() {
    return this.areas.reduce((count, area) => {
      return count + area.selectedProductionTubeCount;
    }, 0)
  }

  get tubeCount() {
    return this.areas.reduce((count, area) => {
      return count + area.productionTubeCount;
    }, 0)
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

  _getSelectedSkillsIds() {
    return this.areas.reduce((areaValues, area) => {
      const competences = area.competences;
      return competences.reduce((competenceValues, competence) => {
        const tubes = competence.tubes;
        return tubes.reduce((tubeValues, tube) => {
          if (tube.selectedLevel) {
            tubeValues = tubeValues.concat(tube.selectedSkills);
          }
          return tubeValues;
        }, competenceValues);
      }, areaValues);
    }, []);
  }

  @action
  displayTube(tube) {
    this.selectedTube = tube;
    this.selectedTubeLevel = tube.selectedLevel;
    this.selectedTubeSkills = tube.selectedSkills;
    this.displayTubeLevel = true;
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
  unsetProfileTube(tube) {
    tube.selectedLevel = false;
    tube.selectedSkills = [];
  }

  @action
  generate() {
    const ids = this._getSelectedSkillsIds();
    let fileName = 'profil_identifiants_' + (new Date()).toLocaleString('fr-FR') + '.txt';
    this.fileSaver.saveAs(ids.join(','), fileName);
  }

  @action
  save() {
    let data = this.areas.reduce((areaValues, area) => {
      let competences = area.competences;
      return competences.reduce((competenceValues, competence) => {
        let tubes = competence.tubes;
        return tubes.reduce((tubeValues, tube) => {
          if (tube.selectedLevel) {
            tubeValues.push({
              id: tube.pixId,
              level: tube.selectedLevel,
              skills: tube.selectedSkills
            })
          }
          return tubeValues;
        }, competenceValues);
      }, areaValues);
    }, []);
    let fileName = 'profil_' + (new Date()).toLocaleString('fr-FR') + '.json';
    this.get('fileSaver').saveAs(JSON.stringify(data), fileName);
  }

  @action
  getProfileId() {
    this.displaySingleEntry = true;
  }

  @action
  closeSingleEntry() {
    this.displaySingleEntry = false;
  }

  @action
  generateSQL(profileId) {
    const ids = this._getSelectedSkillsIds();
    const sql = ids.reduce((content, id) => {
      return content + `\n${profileId},${id}`
    }, 'targetProfileId,skillId');

    let fileName = `generate_profile_${profileId}_${(new Date()).toLocaleString('fr-FR')}.csv`;
    this.fileSaver.saveAs(sql, fileName);
  }

  @action
  load() {
    let fileInput = document.getElementById('target-profile__open-file');
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
          })
        });
        that.selectedSources = sources;
        this.notify.message('Fichier correctement chargé');
        //TODO: find a better way to be able to reload same file
        document.getElementById('target-profile__open-file').value = '';
      };
      reader.readAsText(file);
    } catch (error) {
      this.notify.error('Erreur lors de l\'ouverture du fichier');
    }
  }

  @action
  showTubeName(name, competence) {
    competence._tubeName =  name;
  }

  @action
  hideTubeName(competence) {
    competence._tubeName = null;
  }

  _getTubeSkillsAndMaxLevel(tube) {
    const productionSkill = tube.productionSkills;
    const level = productionSkill[productionSkill.length - 1].level;
    const skills = productionSkill.reduce((ids, skill) => {
      if (skill) {
        skill._selected = true;
        ids.push(skill.pixId);
      }
      return ids;
    }, []);
    return [skills, level];
  }
}
