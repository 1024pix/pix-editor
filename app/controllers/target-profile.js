import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {computed} from '@ember/object';
import $ from "jquery";


export default Controller.extend({
  selectedTube: null,
  selectedTubeLevel: false,
  fileSaver: service('file-saver'),
  application: controller(),
  showTubeDetails: false,
  filter: false,
  init() {
    this._super();
    this.set("selectedTubeSkills", []);
  },
  selectedTubeCount: computed('model.@each.selectedProductionTubeCount', function () {
    return this.get('model').reduce((count, area) => {
      return count + area.get('selectedProductionTubeCount');
    }, 0)
  }),
  tubeCount: computed('model.@each.productionTubeCount', function () {
    return this.get('model').reduce((count, area) => {
      return count + area.get('productionTubeCount');
    }, 0)
  }),
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
  },
  actions: {
    displayTube(tube) {
      this.set('selectedTube', tube);
      this.set('selectedTubeLevel', tube.get("selectedLevel"));
      this.set('selectedTubeSkills', tube.get("selectedSkills"));
      $('.popin-tube-level').modal('show');
    },
    setProfileTube(tube, level, skills) {
      if (!level) {
        const productionSkill = tube.get("productionSkills");
        level = productionSkill[productionSkill.length - 1].get('level');
        skills = productionSkill.reduce((ids, skill) => {
          if (skill) {
            skill.set('_selected', true);
            ids.push(skill.id);
          }
          return ids;
        }, []);
      }
      tube.set('selectedLevel', level);
      tube.set('selectedSkills', skills);
    },
    unsetProfileTube(tube) {
      tube.set('selectedLevel', false);
      tube.set('selectedSkills', []);
    },
    generate() {
      const ids = this._getSelectedSkillsIds();
      let fileName = 'profil_identifiants_' + (new Date()).toLocaleString('fr-FR') + '.txt';
      this.get("fileSaver").saveAs(ids.join(","), fileName);
    },
    save() {
      let areas = this.get('model');
      let data = areas.reduce((areaValues, area) => {
        let competences = area.get('competences');
        return competences.reduce((competenceValues, competence) => {
          let tubes = competence.get('tubes');
          return tubes.reduce((tubeValues, tube) => {
            if (tube.get("selectedLevel")) {
              tubeValues.push({
                id: tube.id,
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
    },
    getProfileId() {
      $('.popin-enter-profile-id').modal('show');
    },
    generateSQL(profileId) {
      const ids = this._getSelectedSkillsIds();
      const sql = ids.reduce((content, id) => {
        return content + `\n${profileId},${id}`
      }, 'targetProfileId,skillId');

      let fileName = `generate_profile_${profileId}_${(new Date()).toLocaleString('fr-FR')}.csv`;
      this.get("fileSaver").saveAs(sql, fileName);
    },
    load() {
      let fileInput = document.getElementById('target-profile__open-file');
      fileInput.click();
    },
    openFile(event) {
      try {
        const that = this;
        const file = event.target.files[0];
        const reader = new FileReader();
        const areas = this.get("model");
        const application = this.get("application");
        reader.onload = function (event) {
          const data = event.target.result;
          const tubes = JSON.parse(data);
          const indexedTubes = tubes.reduce((values, tube) => {
            values[tube.id] = tube;
            return values;
          }, {});
          areas.forEach(area => {
            const competences = area.get('competences');
            competences.forEach(competence => {
              const tubes = competence.get('tubes');
              tubes.forEach(tube => {
                if (indexedTubes[tube.id]) {
                  if (indexedTubes[tube.id].level === 'max') {
                    that.send('setProfileTube',tube)
                  } else {
                    tube.set("selectedLevel", indexedTubes[tube.id].level);
                    tube.set("selectedSkills", indexedTubes[tube.id].skills);
                  }
                } else {
                  tube.set("selectedLevel", false);
                  tube.set("selectedSkills", []);
                }
              });
            })
          });
          application.send("showMessage", "Fichier correctement chargé", true);
          document.getElementById('target-profile__open-file').value = '';
        };
        reader.readAsText(file);
      } catch (error) {
        this.get("application").send("showMessage", "Erreur lors de l'ouverture du fichier", false);
      }
    },
    showTubeName(name, competence) {
      competence.set("_tubeName", name);
    },
    hideTubeName(competence) {
      competence.set("_tubeName", null);
    },
    scrollTo(anchor) {
      const target = document.querySelector(`#${anchor}`);
      document.querySelector('.target-profile').scrollTo({top: target.offsetTop - 154, left: 0, behavior: 'smooth'})
    }
  }
});
