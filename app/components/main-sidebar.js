import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';

@classic
@tagName('')
export default class MainSidebar extends Component {
  version = ENV.APP.version;

  @service config;
  @service store;
  @service router;
  @service('file-saver') fileSaver;

  selected = null;
  routeModel = null;

  @alias('config.author')
  author;

  _formatCSVString(str) {
    if (str) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return ' '
  }

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

  @action
  getSearchResults(query) {
    if (query.substr(0, 1) === '@') {
      this.routeModel = 'skill';
      return this.store.query('skill', {
        filterByFormula: `FIND('${query}', Nom)`,
        maxRecords: 20,
        sort: [{field: 'Nom', direction: 'asc'}]
      })
        .then(skills => {
          return skills.map(skill => ({
            title: skill.name,
            name: skill.name
          }));
        });
    } else if (query.substr(0, 3) === 'rec') {
      this.routeModel = 'challenge';
      return this.store.query('challenge', {
        filterByFormula: `AND(FIND('${query}', {id persistant}) , Statut != 'archive')`,
        maxRecords: 20
      })
        .then(challenges => {
          return challenges.map(challenge => ({
            title: challenge.id,
            id: challenge.id
          }));
        });
    } else {
      this.routeModel = 'challenge';
      return this.store.query('challenge', {
        filterByFormula: `AND(FIND('${query.toLowerCase().replace(/'/g, "\\'")}', LOWER(CONCATENATE(Consigne,Propositions,{Embed URL}))) , Statut != 'archive')`,
        maxRecords: 20
      })
        .then(challenges => {
          return challenges.map(challenge => ({
            title: challenge.instructions.substr(0, 100),
            id: challenge.id
          }));
        });
    }
  }

  @action
  linkTo(item) {
    const route = this.routeModel;
    const router = this.router;
    this.args.burger.state.actions.close();
    if (route === 'skill') {
      router.transitionTo(route, item.name);
    } else {
      router.transitionTo(route, item.id);
    }
  }
}
