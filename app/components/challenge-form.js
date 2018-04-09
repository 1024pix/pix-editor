import Component from "@ember/component";
import {computed} from "@ember/object";
import {inject as service} from "@ember/service";

export default Component.extend({
  config:service(),
  init() {
    this._super(...arguments);
    this.options = {
      'types': ["QCU", "QCM", "QROC", "QROCM-ind", "QROCM-dep", "QRU"],
      'pedagogy': ["e-preuve", "q-savoir", "q-situation"],
      'status':["proposé", "pré-validé", "validé sans test", "validé", "archive"],
      'declinable':["", "facilement", "difficilement", "permutation", "non"]
    }
  },
  authors:computed("config.authorNames", function() {
    return this.get("config.authorNames");
  })
});
