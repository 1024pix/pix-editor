import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SidebarExportComponent extends Component {

  @service('file-saver') fileSaver;

  @action
  shareAreas() {
    this.args.isLoading('Récupération des sujets');
    const areas = this.args.areas;
    const getCompetences = areas.map(area => area.competences);
    return Promise.all(getCompetences)
      .then(areaCompetences => {
        const getTubes = areaCompetences.map(competences => competences.map(competence => competence.rawTubes)).flat();
        return Promise.all(getTubes);
      })
      .then(competenceTubes => {
        const getSkills = competenceTubes.map(tubes => tubes.map(tube => tube.rawSkills)).flat();
        return Promise.all(getSkills);
      })
      .then(tubeSkills => {
        const getChallenges = tubeSkills.map(skills => skills.map(skill => skill.challenges)).flat();
        return Promise.all(getChallenges);
      })
      .then(() => {
        const csvContent = areas.reduce((content, area) => {
          return area.sortedCompetences.reduce((content, competence) => {
            return competence.productionTubes.reduce((content, tube) => {
              let fields = [
                area.name,
                competence.name,
                tube.name,
                tube.title,
                tube.description,
                tube.practicalTitle,
                tube.practicalDescription,
                tube.productionSkills.reduce((table, skill) => {
                  table[skill.level - 1] = skill.name;
                  return table;
                }, ['░', '░', '░', '░', '░', '░', '░', '░']).join(',')
              ];
              fields = fields.map(field => this._formatCSVString(field));
              return content + '\n' + fields.join(',');
            }, content)
          }, content)
        }, '"Domaine","Compétence","Tube","Titre","Description","Titre pratique","Description pratique","Liste des acquis"');
        const fileName = `Export_Sujets_${(new Date()).toLocaleString('fr-FR')}.csv`;
        this.fileSaver.saveAs(csvContent, fileName);
        this.args.showMessage('Sujets exportés', true);
      })
      .finally(() => {
        this.args.finishedLoading();
      });
  }

  _formatCSVString(str) {
    if (str) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return ' '
  }

}
