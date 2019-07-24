import PopinBase from "./popin-base";
import {inject as service} from '@ember/service';


export default PopinBase.extend({
  isCrush: false,
  edition:true,
  isSaving: false,
  options:{
    'format':['Vidéo', 'site'],
    'level':[1,2,3,4,5,6,7,8,9,10],
    'tags':['t0', 't1', 't2']
  },
  store: service(),
  item: {},
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },
  actions: {

    saveTutorial(item) {
      console.log(item);
      if(!this.isSaving){
        this.set('isSaving', true);
        let isCrush = this.get('isCrush');
        const date = new Date();
        item.date = `${date.getFullYear()} ${date.getMonth() + 1}`;
        item.crush = isCrush?'yes':"";
        this.store.createRecord('tutorial', item).save().then(() => {
          alert('saved');
          this.set('isSaving', false);
        })
      }

    },
    toCrush() {
      let isCrush = !this.get('isCrush');
      this.set('isCrush', isCrush);
    }

  }
});
