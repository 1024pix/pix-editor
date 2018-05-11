import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import DS from 'ember-data';

export default Component.extend({
  classNames:['field'],
  store:service(),
  loading:alias("tutorials.isPending"),
  empty:computed("ids", function() {
    let ids = this.get("ids");
    return (!ids || ids.length === 0);
  }),
  tutorials:computed("ids", function() {
    let ids = this.get("ids");
    if (ids && ids.length > 0) {
      return DS.PromiseArray.create({
        promise:this.get("store").query("tutorial", {filterByFormula:"OR(RECORD_ID() = '"+ids.join("',RECORD_ID() ='")+"')"})
      });
    } else {
      return [];
    }
  })
});
