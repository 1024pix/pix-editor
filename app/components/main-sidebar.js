import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ENV from 'pixeditor/config/environment';

@classic
@tagName('')
export default class MainSidebar extends Component {
  version = ENV.APP.version;

  @service
  config;

  @service
  store;

  @service
  router;

  @service('file-saver')
  fileSaver;

  selected = null;
  routeModel = null;

  @alias('config.author')
  author;

  _formatCSVString(str) {
    if (str) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return ' '
  }

  @action
  shareAreas() {
    this.get('isLoading')('Récupération des sujets');
    const areas = this.get('areas');
    const getCompetences = areas.map(area => area.get('competences'));
    return Promise.all(getCompetences)
      .then(areaCompetences => {
        const getTubes = areaCompetences.map(competences => competences.map(competence => competence.get('rawTubes'))).flat();
        return Promise.all(getTubes);
      })
      .then(competenceTubes => {
        const getSkills = competenceTubes.map(tubes => tubes.map(tube => tube.get('rawSkills'))).flat();
        return Promise.all(getSkills);
      })
      .then(tubeSkills => {
        const getChallenges = tubeSkills.map(skills => skills.map(skill => skill.get('challenges'))).flat();
        return Promise.all(getChallenges);
      })
      .then(() => {
        const csvContent = areas.reduce((content, area) => {
          return area.get('sortedCompetences').reduce((content, competence) => {
            return competence.get('productionTubes').reduce((content, tube) => {
              let fields = [
                area.get('name'),
                competence.get('name'),
                tube.get('name'),
                tube.get('title'),
                tube.get('description'),
                tube.get('practicalTitle'),
                tube.get('practicalDescription'),
                tube.get('productionSkills').reduce((table, skill) => {
                  table[skill.get('level') - 1] = skill.get('name');
                  return table;
                }, ['░', '░', '░', '░', '░', '░', '░', '░']).join(',')
              ];
              fields = fields.map(field => this._formatCSVString(field));
              return content + '\n' + fields.join(',');
            }, content)
          }, content)
        }, '"Domaine","Compétence","Tube","Titre","Description","Titre pratique","Description pratique","Liste des acquis"');
        const fileName = `Export_Sujets_${(new Date()).toLocaleString('fr-FR')}.csv`;
        this.get('fileSaver').saveAs(csvContent, fileName);
        this.get('showMessage')('Sujets exportés', true);
      })
      .finally(() => {
        this.get('finishedLoading')();
      });
  }

  @action
  getSearchResults(query) {
    if (query.substr(0, 1) === '@') {
      this.set('routeModel', 'skill');
      return this.get('store').query('skill', {
        filterByFormula: `FIND('${query}', Nom)`,
        maxRecords: 20,
        sort: [{field: 'Nom', direction: 'asc'}]
      })
        .then(skills => {
          return skills.map(skill => ({
            title: skill.get('name'),
            name: skill.get('name')
          }));
        });
    } else if (query.substr(0, 3) === 'rec') {
      this.set('routeModel', 'challenge');
      return this.get('store').query('challenge', {
        filterByFormula: `AND(FIND('${query}', RECORD_ID()) , Statut != 'archive')`,
        maxRecords: 20
      })
        .then(challenges => {
          return challenges.map(challenge => ({
            title: challenge.get('id'),
            id: challenge.get('id')
          }));
        });
    } else {
      this.set('routeModel', 'challenge');
      return this.get('store').query('challenge', {
        filterByFormula: `AND(FIND('${query.toLowerCase().replace(/'/g, "\\'")}', LOWER(CONCATENATE(Consigne,Propositions,{Embed URL}))) , Statut != 'archive')`,
        maxRecords: 20
      })
        .then(challenges => {
          return challenges.map(challenge => ({
            title: challenge.get('instructions').substr(0, 100),
            id: challenge.get('id'),
          }));
        });
    }
  }

  @action
  linkTo(item) {
    const route = this.get('routeModel');
    const router = this.get('router');
    this.get('burger.state.actions.close')();
    if (route === 'skill') {
      router.transitionTo(route, item.name);
    } else {
      router.transitionTo(route, item.id);
    }
  }
}
