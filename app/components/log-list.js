import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from "@ember/service";

export default Component.extend({
  classNameBindings: ["listType"],
  listType: "template-list",
  scrollLeft: 0,
  store: service(),
  router: service(),
  init() {
    this._super();
    this.currentCount = 0;
    this.columns = [100];
    this.loadedLog = [].pushObject(this.model);

  },
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
    },
    linkToCompetence(competenceNumber, skillId) {
      this.get('store').query('competence', {
        filterByFormula: `FIND('${competenceNumber}', {Sous-domaine})`,
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
        }).catch(e => console.log(e));
    },
    fetch(){
       this.get('store').query("note", {
        sort: [{field: 'Date', direction: 'desc'}]
      }).then(data=>{
         data.map(el=>console.log(el.get('date')))

        return this.get('loadedLog').pushObject(data.toArray())
      })
    }
  }
});
