import PopinBase from "./popin-base";
import {inject as service} from '@ember/service';


export default PopinBase.extend({
  isCrush: false,
  edition:true,
  options:{
    'format':[
      "vidéo",
      "image",
      "son",
      "site",
      "pdf",
      "slide",
      "outil",
      "page",
      "jeu",
      "audio",
      "frise",
      "video"
    ],
    'level':['1','2','3','4','5','6','7','8','9','10'],
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
      this.get("application").send("isLoading");
      let isCrush = this.get('isCrush');
        const date = new Date();
        item.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        item.crush = isCrush?'yes':"";
        console.log(item);
        this.store.createRecord('tutorial', item).save()
          .then(() => {
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Tutoriel créé", true);
          this.set('item', {})
        })
          .catch((error)=>{
            console.error(error);
            this.get("application").send("finishedLoading");
            this.get("application").send("showMessage", "Erreur lors de la création de l'acquis", true);
          })
      }

    ,
    toCrush() {
      let isCrush = !this.get('isCrush');
      this.set('isCrush', isCrush);
    }

  }
});
