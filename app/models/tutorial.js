import classic from 'ember-classic-decorator';
import Model, { attr, hasMany } from '@ember-data/model';
import {computed} from '@ember/object';
import DS from 'ember-data';

@classic
export default class TutorialModel extends Model {
  @attr title;
  @attr duration;
  @attr source;
  @attr format;
  @attr link;
  @attr license;
  @attr level;
  @attr date;
  @attr crush;

  @hasMany('tag') tags;

  @computed('crush')
  get isFavorite() {
    const crush = this.get('crush');
    if(crush){
      return crush.toLowerCase() === 'yes';
    }
    return false;
  }

  @computed('tags.[]')
  get tagsTitle() {
    return DS.PromiseObject.create({
      promise:this.get('tags').then((tags)=> tags.map((tag)=>tag.get('title')).join(' | '))
    })
  }
}
