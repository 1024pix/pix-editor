import Component from '@ember/component';
import ENV from 'pixeditor/config/environment';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import $ from 'jquery';

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
  hideSidebar() {
    $('#main-sidebar').sidebar('hide');
  },
  _formatCSVString(str) {
    if (str) {
      return str.replace(/"/g, '""')
    }
    return ' '
  },
  actions: {
    async shareAreas() {
      let buildCSV = [];
      const areas = this.get('areas').toArray();
      for (const area of areas) {
        const competences = area.get('sortedCompetences');
        for (const competence of competences) {
          const productionTubes = await competence.get('productionTubes');
          for (const productionTube of productionTubes) {
            const filledSkills = await productionTube.get('filledSkills');
            let skills = '';
            for (const skill of filledSkills) {
              if (skill) {
                const productionTemplate = await skill.get('productionTemplate');
                if (productionTemplate) {
                  skills += `${skill.name},`;
                } else {
                  skills += '░,';
                }
              } else {
                skills += '░,';
              }
            }
            skills = skills.substring(0, skills.length - 1);
            const tubeDescription = this._formatCSVString(productionTube.description);
            const tubePracticalDescription = this._formatCSVString(productionTube.practicalDescription);
            buildCSV.push(['"' + area.name, competence.name, productionTube.name, productionTube.title, tubeDescription, productionTube.practicalTitle, tubePracticalDescription, skills + '"']);
          }

        }
      }

      const content = buildCSV.reduce((content, row) => {
        return content + `\n${row.join('","')}`
      }, '"Sujet","Compétence","Tube","Titre","Description","Titre pratique","Description pratique","Liste des acquis"');
      const fileName = `Description_Sujets_${(new Date()).toLocaleString('fr-FR')}.csv`;
      this.get("fileSaver").saveAs(content, fileName);


    }
  }
});
