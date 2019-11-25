import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  title: DS.attr(),
  duration: DS.attr(),
  source: DS.attr(),
  format: DS.attr(),
  link: DS.attr(),
  license: DS.attr(),
  tags: DS.hasMany('tag'),
  level: DS.attr(),
  date: DS.attr(),
  crush: DS.attr(),

  isFavorite:computed('crush', function(){
    const crush = this.get('crush');
    if(crush){
      return crush.toLowerCase() === 'yes';
    }
    return 'no';
  }),
  tagsTitle:computed('tags.[]', function(){
    return DS.PromiseObject.create({
      promise:this.get('tags').then((tags)=> tags.map((tag)=>tag.get('title')).join(' | '))
    })
  })
});
