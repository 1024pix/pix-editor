import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import {inject as controller} from '@ember/controller';


@classic
export default class TargetProfileController extends Controller {
  selectedTube = null;
  selectedTubeLevel = false;

  @service('file-saver')
  fileSaver;

  @controller
  application;

  showTubeDetails = false;
  filter = false;
  displayTubeLevel = false;
  displaySingleEntry = false;

  init() {
    super.init();
    this.set("selectedTubeSkills", []);
  }

  calculatePosition(trigger) {
    let { top, left, width } = trigger.getBoundingClientRect();
    let style = {
      left: left + width,
      top: top +  window.pageYOffset
    };
    return { style };
  }

  @computed('model.@each.selectedProductionTubeCount')
  get selectedTubeCount() {
    return this.get('model').reduce((count, area) => {
      return count + area.get('selectedProductionTubeCount');
    }, 0)
  }

  @computed('model.@each.productionTubeCount')
  get tubeCount() {
    return this.get('model').reduce((count, area) => {
      return count + area.get('productionTubeCount');
    }, 0)
  }

  _getSelectedSkillsIds() {
    const areas = this.get('model');
    return areas.reduce((areaValues, area) => {
      const competences = area.get('competences');
      return competences.reduce((competenceValues, competence) => {
        const tubes = competence.get('tubes');
        return tubes.reduce((tubeValues, tube) => {
          if (tube.get("selectedLevel")) {
            tubeValues = tubeValues.concat(tube.get("selectedSkills"));
          }
          return tubeValues;
        }, competenceValues);
      }, areaValues);
    }, []);
  }

  @action
  displayTube(tube) {
    this.set('selectedTube', tube);
    this.set('selectedTubeLevel', tube.get("selectedLevel"));
    this.set('selectedTubeSkills', tube.get("selectedSkills"));
    this.set('displayTubeLevel', true);
  }

  @action
  setProfileTube(tube, level, skills) {
    if (!level) {
      [skills, level] = this._getTubeSkillsAndMaxLevel(tube);
    }
    tube.set('selectedLevel', level);
    tube.set('selectedSkills', skills);
  }

  @action
  unsetProfileTube(tube) {
    tube.set('selectedLevel', false);
    tube.set('selectedSkills', []);
  }

  @action
  generate() {
    const ids = this._getSelectedSkillsIds();
    let fileName = 'profil_identifiants_' + (new Date()).toLocaleString('fr-FR') + '.txt';
    this.get("fileSaver").saveAs(ids.join(","), fileName);
  }

  @action
  save() {
    let areas = this.get('model');
    let data = areas.reduce((areaValues, area) => {
      let competences = area.get('competences');
      return competences.reduce((competenceValues, competence) => {
        let tubes = competence.get('tubes');
        return tubes.reduce((tubeValues, tube) => {
          if (tube.get("selectedLevel")) {
            tubeValues.push({
              id: tube.get('pixId'),
              level: tube.get("selectedLevel"),
              skills: tube.get("selectedSkills")
            })
          }
          return tubeValues;
        }, competenceValues);
      }, areaValues);
    }, []);
    let fileName = 'profil_' + (new Date()).toLocaleString('fr-FR') + '.json';
    this.get("fileSaver").saveAs(JSON.stringify(data), fileName);
  }

  @action
  getProfileId() {
    this.set('displaySingleEntry', true)
  }

  @action
  generateSQL(profileId) {
    const ids = this._getSelectedSkillsIds();
    const sql = ids.reduce((content, id) => {
      return content + `\n${profileId},${id}`
    }, 'targetProfileId,skillId');

    let fileName = `generate_profile_${profileId}_${(new Date()).toLocaleString('fr-FR')}.csv`;
    this.get("fileSaver").saveAs(sql, fileName);
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
      const areas = this.get("model");
      const application = this.get("application");
      reader.onload = (event) => {
        const data = event.target.result;
        const tubes = JSON.parse(data);
        const indexedTubes = tubes.reduce((values, tube) => {
          values[tube.get('pixId')] = tube;
          return values;
        }, {});
        areas.forEach(area => {
          const competences = area.get('competences');
          competences.forEach(competence => {
            const tubes = competence.get('tubes');
            tubes.forEach(tube => {
              if (indexedTubes[tube.get('pixId')]) {
                if (indexedTubes[tube.get('pixId')].level === 'max') {
                  const [skills, level] = this._getTubeSkillsAndMaxLevel(tube);
                  tube.set("selectedLevel", level);
                  tube.set("selectedSkills", skills);
                } else {
                  tube.set("selectedLevel", indexedTubes[tube.get('pixId')].level);
                  tube.set("selectedSkills", indexedTubes[tube.get('pixId')].skills);
                }
              } else {
                tube.set("selectedLevel", false);
                tube.set("selectedSkills", []);
              }
            });
          })
        });
        application.send("showMessage", "Fichier correctement chargé", true);
        //TODO: find a better way to be able to reload same file
        document.getElementById('target-profile__open-file').value = '';
      };
      reader.readAsText(file);
    } catch (error) {
      this.get("application").send("showMessage", "Erreur lors de l'ouverture du fichier", false);
    }
  }

  @action
  showTubeName(name, competence) {
    competence.set("_tubeName", name);
  }

  @action
  hideTubeName(competence) {
    competence.set("_tubeName", null);
  }

  @action
  scrollTo(anchor) {
    const target = document.querySelector(`#${anchor}`);
    document.querySelector('.target-profile').scrollTo({top: target.offsetTop - 154, left: 0, behavior: 'smooth'})
  }

  @action
  prevent() {
    return false;
  }

  @action
  open(dropdown) {
      dropdown.actions.open();
  }

  @action
  close(dropdown) {
    dropdown.actions.close();

  }

  _getTubeSkillsAndMaxLevel(tube) {
    const productionSkill = tube.get("productionSkills");
    const level = productionSkill[productionSkill.length - 1].get('level');
    const skills = productionSkill.reduce((ids, skill) => {
      if (skill) {
        skill.set('_selected', true);
        ids.push(skill.get('pixId'));
      }
      return ids;
    }, []);
    return [skills, level];
  }
}
