import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from "@ember/service";

export default Component.extend({
  classNameBindings: ["listType"],
  listType: "template-list",
  scrollLeft: 0,
  store: service(),
  router:service(),
  init() {
    this._super();
    this.currentCount = 0;
    this.columns = [100];
    // this.pageSize = 10;
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
    linkToCompetence(competenceNumber, skillName) {
      console.log(competenceNumber, skillName)
      this.get('store').findAll('competence', {
        // filterByFormula:`FIND('5.1', Sous-domaine)`,
        fields: ['Sous-domaine']
      }).then((competence) => {
        const competenceId = competence.map(competence => {
          return {code:competence.get('code'), id:competence.get('id')}
        })
          .filter(competence => {
            return competence.code === competenceNumber
          });
        if(!skillName){
          this.get('router').transitionTo('competence', competenceId[0].id)
        }else{

        }
      }).catch(e=>console.log(e));
    }
    // fetch(pageOffset, pageSize, stats) {
    //   // function which returns a "thenable" (*required*)
    //   let params = {
    //     pageSize: 10,
    //     sort: [{field: 'Date', direction: 'desc'}]
    //   };
    //   console.log(pageSize, stats)
    //   // fetch a page of records at the pageOffset
    //   return this.get('store').query("note", params).then(data => {
    //     let meta = data.get("meta");
    //     console.log('meta', meta);
    //     stats = meta.offset;
    //     return data.toArray();
    //   });
    // }
  }
});
