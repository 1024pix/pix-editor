import Component from '@ember/component';
import ENV from 'pixeditor/config/environment';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';

export default Component.extend({
  tagName: '',
  version: ENV.APP.version,
  config: service(),
  store: service(),
  router: service(),
  fileSaver: service('file-saver'),
  query: '',
  init() {
    this._super(...arguments);
    let that = this;
    this.searchErrors = {
      noResults: 'Pas de résultat'
    };
    this.searchAPISettings = {
      responseAsync: function (settings, callback) {
        that.getSearchResults(settings, callback);
      }
    };

  },
  searching: alias('searchResults.isPending'),
  author: alias('config.author'),
  getSearchResults(settings, callback) {
    let query = settings.urlData.query;
    if (query.substr(0, 1) === '@') {
      this.get('store').query('skill', {
        filterByFormula: `FIND('${query}', Nom)`,
        maxRecords: 20,
        sort: [{field: 'Nom', direction: 'asc'}]
      })
      .then(skills => {
        const results = skills.map(skill => ({
          title: skill.get('name'),
          url: this.get('router').urlFor('skill', skill.get('name'))
        }));
        callback({
          success: true,
          results: results
        });
      });
    } else if (query.substr(0, 3) === 'rec') {
      this.get('store').query('challenge', {
        filterByFormula: `AND(FIND('${query}', RECORD_ID()) , Statut != 'archive')`,
        maxRecords: 20
      })
      .then(challenges => {
        const results = challenges.map(challenge => ({
          title: challenge.get('id'),
          url: this.get('router').urlFor('challenge', challenge.get('id'))
        }));
        callback({
          success: true,
          results: results
        });
      });
    } else {
      this.get('store').query('challenge', {
        filterByFormula: `AND(FIND('${query.toLowerCase().replace(/'/g, "\\'")}', LOWER(CONCATENATE(Consigne,Propositions,{Embed URL}))) , Statut != 'archive')`,
        maxRecords: 20
      })
      .then(challenges => {
        const results = challenges.map(challenge => ({
          title: challenge.get('instructions').substr(0, 100),
          url: this.get('router').urlFor('challenge', challenge.get('id'))
        }));
        callback({
          success: true,
          results: results
        });
      });
    }
  },

  _formatCSVString(str) {
    if (str) {
      return '"'+str.replace(/"/g, '""')+'"';
    }
    return ' '
  },
  actions: {
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
                  table[skill.get('level')-1] = skill.get('name');
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
  }
});
