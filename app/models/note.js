import classic from 'ember-classic-decorator';
import {computed} from '@ember/object';
import Model, { attr } from '@ember-data/model';

@classic
export default class NoteModel extends Model {

  @attr text;
  @attr challengeId;
  @attr author;
  @attr competence;
  @attr skills;
  @attr production;
  @attr createdAt;
  @attr status;
  @attr('boolean', {defaultValue: false }) changelog;

  @computed('createdAt')
  get date() {
    let createdDate = this.get('createdAt');
    return (new Date(createdDate)).toLocaleDateString('fr');
  }
}
