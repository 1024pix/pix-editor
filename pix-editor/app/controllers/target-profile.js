import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {inject as controller} from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
export default class TargetProfileController extends Controller {

  @tracked selectedTubeSkills = [];
  @tracked selectedTube = null;
  @tracked selectedTubeLevel = false;
  @tracked showTubeDetails = false;
  @tracked filter = false;
  @tracked displayTubeLevel = false;
  @tracked displaySingleEntry = false;

  @service('file-saver') fileSaver;

  @controller application;

  calculatePosition(trigger) {
    let { top, left, width } = trigger.getBoundingClientRect();
    let style = {
      left: left + width,
      top: top +  window.pageYOffset
    };
    return { style };
  }

  get selectedTubeCount() {
    return this.model.reduce((count, area) => {
      return count + area.selectedProductionTubeCount;
    }, 0)
  }

  get tubeCount() {
    return this.model.reduce((count, area) => {
      return count + area.productionTubeCount;
    }, 0)
  }

  _getSelectedSkillsIds() {
    return this.model.reduce((areaValues, area) => {
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
    let data = this.model.reduce((areaValues, area) => {
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
      const application = this.application;
      reader.onload = (event) => {
        const data = event.target.result;
        const tubes = JSON.parse(data);
        const indexedTubes = tubes.reduce((values, tube) => {
          values[tube.id] = tube;
          return values;
        }, {});
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
              } else {
                tube.selectedLevel = false;
                tube.selectedSkills = [];
              }
            });
          })
        });
        application.send('showMessage', 'Fichier correctement chargé', true);
        //TODO: find a better way to be able to reload same file
        document.getElementById('target-profile__open-file').value = '';
      };
      reader.readAsText(file);
    } catch (error) {
      this.application.send('showMessage', 'Erreur lors de l\'ouverture du fichier', false);
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

  @action
  exportPdf() {
    const h1Size = 18;
    const h1LineHeight = 20;
    const h1MarginTop = 9;
    const rectHeight = 30;
    const pSize = 12;
    const marginX = 30;
    const extraMarginX = 20;
    const marginY = 60;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const colors = ['#F1A141','#57C884','#12A3FF','#FF3F94','#574DA6'];
    const areas = this.model;
    let y = marginY;
    areas.forEach((area,index) => {
      area.competences.filter(competence => competence.selectedProductionTubeCount > 0).forEach(competence => {
        pdf.setFillColor(colors[index]);
        pdf.setDrawColor(0);
        pdf.rect(marginX, y-rectHeight+h1MarginTop, 595 - 2*marginX, rectHeight, "F");
        pdf.setFontSize(h1Size);
        pdf.setTextColor('#FFFFFF');
        pdf.text(marginX+extraMarginX, y, `${competence.code} ${competence.title}`);
        y += h1LineHeight;
        const tubeValues = competence.productionTubes.filter(tube => tube.selectedLevel).reduce((values,tube) => {
          values.push([{content:tube.practicalTitle, styles:{cellWidth:200, fontStyle:'bold'}},tube.practicalDescription]);
          return values;
        }, []);
        pdf.setTextColor('#000000');
        pdf.setFontSize(pSize);
        pdf.setDrawColor('#000000');
        pdf.autoTable({
          startY:y,
          body:tubeValues,
          theme:'striped',
          pageBreak: 'auto',
          rowPageBreak: 'auto'});
        y+=pdf.previousAutoTable.finalY;
      });
    });
    pdf.output("dataurlnewwindow");
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
