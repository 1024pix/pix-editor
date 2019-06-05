import Component from '@ember/component';
import ENV from 'pixeditor/config/environment';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import $ from 'jquery';

export default Component.extend({
  tagName:'',
  version:ENV.APP.version,
  config:service(),
  store:service(),
  router:service(),
  query:'',
  init() {
    this._super(...arguments);
    let that = this;
    this.searchErrors = {
      noResults: 'Pas de résultat'
    };
    this.searchAPISettings = {
      responseAsync: function(settings, callback) {
        that.getSearchResults(settings, callback);
      }
    };

  },
  searching:alias('searchResults.isPending'),
  author:alias('config.author'),
  getSearchResults(settings, callback) {
    let query = settings.urlData.query;
    if (query.substr(0,1) === '@') {
      this.get('store').query('skill', {filterByFormula:`FIND('${query}', Nom)`, maxRecords:20, sort: [{field: 'Nom', direction: 'asc'}]})
      .then(skills => {
        const results = skills.map(skill => ({title:skill.get('name'), url:this.get('router').urlFor('skill', skill.get('name'))}));
        callback({
          success:true,
          results:results
        });
      });
    } else if (query.substr(0,3) === 'rec') {
      this.get('store').query('challenge', {filterByFormula:`AND(FIND('${query}', RECORD_ID()) , Statut != 'archive')`, maxRecords:20})
      .then(challenges => {
        const results = challenges.map(challenge => ({title:challenge.get('id'), url:this.get('router').urlFor('challenge', challenge.get('id'))}));
        callback({
          success:true,
          results:results
        });
      });
    } else {
      this.get('store').query('challenge', {filterByFormula:`AND(FIND('${query.toLowerCase()}', LOWER(CONCATENATE(Consigne,Propositions,{Embed URL}))) , Statut != 'archive')`, maxRecords:20})
      .then(challenges => {
        const results = challenges.map(challenge => ({title:challenge.get('instructions').substr(0,100), url:this.get('router').urlFor('challenge', challenge.get('id'))}));
        callback({
          success:true,
          results:results
        });
      });
    }
  },
  hideSidebar() {
    $('#main-sidebar').sidebar('hide');
  }
});
