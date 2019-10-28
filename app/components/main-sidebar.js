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
    shareAreas() {
      const areas = this.get('areas');
      const getData = areas.map(area => {
        return area.get('sortedCompetences')
          .map(competence => {
            return competence.get('productionTubes')
              .then(productionTubes => {
                const getFilledSkills = productionTubes.map(productionTube => productionTube.get('filledSkills').then(filledSkills => ({
                  tube: productionTube,
                  skills: filledSkills
                })));
                return Promise.all(getFilledSkills);
              })
              .then(filledSkills => {
                const getTubeRows = filledSkills.map( item => {
                  const getSkillsData = item.skills.map(skill => {
                    if (skill === false) {
                      return Promise.resolve('░,');
                    } else {
                      return skill.get('productionTemplate')
                        .then(productionTemplate => {
                          if (productionTemplate) {
                            return `${skill.name},`;
                          } else {
                            return '░,';
                          }
                        });
                    }
                  });
                  return Promise.all(getSkillsData).then(skillValues => {
                    debugger
                    skillValues = skillValues.join(',');
                    skillValues = skillValues.substring(0, skillValues.length - 1);
                    const productionTube = item.tube;
                    const tubeDescription = this._formatCSVString(productionTube.description);
                    const tubePracticalDescription = this._formatCSVString(productionTube.practicalDescription);
                    return [area.name, competence.name, productionTube.name, productionTube.title, tubeDescription, productionTube.practicalTitle, tubePracticalDescription, skillValues];
                  });
                });
                return Promise.all(getTubeRows);
              });
          });
      });
      return Promise.all(getData.flat())
        .then(data => {
          console.log(data.flat())
          const contentCSV = data.flat().reduce((content, data) => {
            return content + `\n${data.map(item => item?`"${item}"`:" ").join(',')}`
          }, '"Domaine","Compétence","Tube","Titre","Description","Titre pratique","Description pratique","Liste des acquis"');
          const fileName = `Description_Sujets_${(new Date()).toLocaleString('fr-FR')}.csv`;
          this.get("fileSaver").saveAs(contentCSV, fileName);
        });

    }
  }
});
