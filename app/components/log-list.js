import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from "@ember/service";

export default Component.extend({
  classNameBindings: ["listType"],
  listType: "template-list",
  store: service(),
  router: service(),
  itemCount: computed('loadedLog.[]', function () {
    return this.get('loadedLog').length
  }),
  init() {
    this._super();
    this.currentCount = 0;
    this.columns = [100];
    this.button = {button:true};
    this.loadedNotes = [];
  },
  loadedLog: computed('model', 'loadedNotes', function() {
    console.debug(this.get('loadedNotes'));
    return [...this.get('model').toArray(), ...this.get('loadedNotes'), this.get('button')];
  }),
  scrollTop: computed('itemCount', {
    get() {
      let count = this.get('itemCount');
      if (count !== this.gcurrentCount) {
        this.currentCount = count;
        return 0;
      }
    },
    set(key, value) {
      this.set('scrollValue', value);
      return value;
    }
  }),

  actions: {
    scrollChange(scrollLeft, scrollTop) {
      this.set('scrollLeft', scrollLeft);
      this.set('scrollTop', scrollTop);
      this.set('scrollMemory', scrollTop)
    },
    linkToCompetence(competenceNumber, skillId) {
      this.get('store').query('competence', {
        filterByFormula: `FIND('${competenceNumber}', {Sous-domaine})`
      })
        .then((competence) => {
          const competenceId = competence.map(competence => {
            return {code: competence.get('code'), id: competence.get('id')}
          });
          if (!skillId) {
            this.get('router').transitionTo('competence', competenceId[0].id)
          } else {
            this.get('router').transitionTo('competence.templates.single', competenceId[0].id, skillId)
          }
        }).catch(e => console.log(`link not found : ${e}`));
    },
    fetch() {
      this.get('store').query("note", {
        sort: [{field: 'Date', direction: 'desc' }],
        nextPage:true
      }).then(data => {
        let loadedNotes = this.get('loadedNotes');
        this.set('loadedNotes', loadedNotes.concat(data.toArray()));
      })
    }
  }
});
