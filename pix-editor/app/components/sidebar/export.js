import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SidebarExportComponent extends Component {

  @service('file-saver') fileSaver;
  @service notify;
  @service loader;

  @action
  async shareAreas() {
    this.loader.start('Récupération des sujets');
    try {
      const areas = this.args.areas;
      await this._loadContent(areas);
      const csvContent = this._buildCSVContent(areas);
      const fileName = `Export_Sujets_${(new Date()).toLocaleString('fr-FR')}.csv`;
      this.fileSaver.saveAs(csvContent, fileName);
      this.notify.message('Sujets exportés');
    } catch (e) {
      console.error(e);
      this.notify.error('Erreur lors de l\'exportation des sujets');
    } finally {
      this.loader.stop();
    }
  }

  async _loadContent(areas) {
    const getCompetences = areas.map(area => area.competences);
    const areaCompetences = await Promise.all(getCompetences);
    const getTubes = areaCompetences.map(competences => competences.map(competence => competence.rawTubes)).flat();
    const competenceTubes = await Promise.all(getTubes);
    const getSkills = competenceTubes.map(tubes => tubes.map(tube => tube.rawSkills)).flat();
    const tubeSkills = await Promise.all(getSkills);
    const getChallenges = tubeSkills.map(skills => skills.map(skill => skill.challenges)).flat();
    await Promise.all(getChallenges);
  }

  _buildCSVContent(areas) {
    return areas.reduce((content, area) => {
      return area.sortedCompetences.reduce((content, competence) => {
        return competence.productionTubes.reduce((content, tube) => {
          let fields = [
            area.name,
            competence.name,
            tube.name,
            tube.title,
            tube.description,
            tube.practicalTitleFr,
            tube.practicalDescriptionFr,
            tube.productionSkills.reduce((table, skill) => {
              table[skill.level - 1] = skill.name;
              return table;
            }, ['░', '░', '░', '░', '░', '░', '░', '░']).join(',')
          ];
          fields = fields.map(field => this._formatCSVString(field));
          return content + '\n' + fields.join(',');

        }, content);
      }, content);
    }, '"Domaine","Compétence","Tube","Titre","Description","Titre pratique","Description pratique","Liste des acquis"');
  }

  _formatCSVString(str) {
    if (str) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return ' ';
  }

}
