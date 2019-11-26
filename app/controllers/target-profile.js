import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import $ from "jquery";


export default Controller.extend({
  selectedTube:null,
  selectedTubeLevel:false,
  fileSaver: service('file-saver'),
  application:controller(),
  showTubeDetails:false,

  init() {
    this._super();
    this.set("selectedTubeSkills", []);
  },
  getSelectedSkillsIds(){
    let areas = this.get('model');
    return areas.reduce((areaValues, area) => {
      let competences = area.get('competences');
      return competences.reduce((competenceValues, competence) => {
        let tubes = competence.get('tubes');
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
      this.set('selectedTube',tube);
      this.set('selectedTubeLevel',tube.get("selectedLevel"));
      this.set('selectedTubeSkills', tube.get("selectedSkills"));
      $('.popin-tube-level').modal('show');
    },
    setProfileTube(tube, level, skills) {
      tube.set('selectedLevel', level);
      tube.set('selectedSkills', skills);
    },
    unsetProfileTube(tube) {
      tube.set('selectedLevel', false);
      tube.set('selectedSkills', []);
    },
    generate() {
     const ids = this.getSelectedSkillsIds();
      let fileName = 'profil_identifiants_'+(new Date()).toLocaleString('fr-FR')+'.txt';
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
                id:tube.id,
                level:tube.get("selectedLevel"),
                skills:tube.get("selectedSkills")
              })
            }
            return tubeValues;
          }, competenceValues);
        }, areaValues);
      }, []);
      let fileName = 'profil_'+(new Date()).toLocaleString('fr-FR')+'.json';
      this.get("fileSaver").saveAs(JSON.stringify(data), fileName);
    },
    getProfileId() {
      $('.popin-enter-profile-id').modal('show');
    },
    generateSQL(profileId) {
      const ids = this.getSelectedSkillsIds();
      const sql = ids.reduce((content, id) => {
        return content+`\n${profileId},${id}`
      },'targetProfileId,skillId');

      let fileName = `generate_profile_${profileId}_${(new Date()).toLocaleString('fr-FR')}.csv`;
      this.get("fileSaver").saveAs(sql, fileName);
    },
    load() {
      let fileInput = document.getElementById('target-profile__open-file');
      fileInput.click();
    },
    openFile(event) {
      try {
        let file = event.target.files[0];
        let reader = new FileReader();
        let areas = this.get("model");
        let application = this.get("application");
        reader.onload = function(event) {
          let data = event.target.result;
          let tubes = JSON.parse(data);
          let indexedTubes = tubes.reduce((values, tube) => {
            values[tube.id] = tube;
            return values;
          }, {});
          areas.forEach(area => {
            let competences = area.get('competences');
            competences.forEach(competence => {
              let tubes = competence.get('tubes');
              tubes.forEach(tube => {
                if (indexedTubes[tube.id]) {
                  tube.set("selectedLevel", indexedTubes[tube.id].level);
                  tube.set("selectedSkills", indexedTubes[tube.id].skills);
                } else {
                  tube.set("selectedLevel", false);
                  tube.set("selectedSkills", []);
                }
              });
            })
          });
          application.send("showMessage", "Fichier correctement chargé", true);
        };
        reader.readAsText(file);
      } catch(error) {
        this.get("application").send("showMessage", "Erreur lors de l'ouverture du fichier", false);
      }
    },
    showTubeName(name, competence) {
      competence.set("_tubeName", name);
    },
    hideTubeName(competence) {
      competence.set("_tubeName", null);
    }

  }
});
