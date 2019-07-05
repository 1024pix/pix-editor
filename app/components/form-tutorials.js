import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import DS from 'ember-data';

export default Component.extend({
  classNames:['field'],
  store:service(),
  loading:alias("tutorials.isPending"),

});
