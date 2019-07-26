import PopinBase from "./popin-base";
import {inject as service} from '@ember/service';


export default PopinBase.extend({
  store: service(),
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },

});
