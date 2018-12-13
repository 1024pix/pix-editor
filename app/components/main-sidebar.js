import Component from '@ember/component';
import ENV from "pixeditor/config/environment";
import {inject as service} from "@ember/service";
import {computed} from "@ember/object";

export default Component.extend({
  tagName:"",
  version:ENV.APP.version,
  config:service(),
  store:service(),
  router:service(),
  query:"",
  init() {
    this._super(...arguments);
    let that = this;
    this.searchErrors = {
      noResults: "Pas de résultat"
    };
    this.searchAPISettings = {
      responseAsync: function(settings, callback) {
        that.getSearchResults(settings, callback);
      }
    };

  },
  searching:computed("searchResults.isPending", function() {
    return (this.get("searchResults.isPending"));
  }),
  author:computed("config.author",function() {
    return this.get("config").get("author");
  }),
  getSearchResults(settings, callback) {
    let query = settings.urlData.query;
    if (query.substr(0,1) === "@") {
      this.get("store").query("skill", {filterByFormula:"FIND('"+query+"', Nom)", maxRecords:20, sort: [{field: "Nom", direction: "asc"}]})
      .then(skills => {
        let results = skills.reduce((current, skill) => {
          let name = skill.get("name");
          current.push({title:name, url:this.get("router").urlFor("skill", name)});
          return current;
        }, []);
        callback({
          success:true,
          results:results
        });
      });
    } else {
      return this.get("store").query("challenge", {filterByFormula:"AND(FIND('"+query+"', RECORD_ID()) , Statut != 'archive')", maxRecords:20})
      .then(challenges => {
        const results = challenges.reduce((current, challenge) => {
          let id = challenge.get("id");
          current.push({title:id, url:this.get("router").urlFor("challenge", id)});
          return current;
        }, []);
        callback({
          success:true,
          results:results
        });
      });
    }
  }
});
