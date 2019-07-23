import Component from '@ember/component';
import {inject as service} from '@ember/service';
import $ from 'jquery';
import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import DS from 'ember-data';

export default Component.extend({
  classNames:['field'],
  popinCreateTutoClass: 'popinCreateTutoClass',
  store:service(),
  loading:alias("tutorials.isPending"),
  actions: {
    openCreateTutoModal: function() {
      $(`.${this.get('popinCreateTutoClass')}`).modal('show');
    },
  }
});
