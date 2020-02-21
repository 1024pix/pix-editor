import classic from 'ember-classic-decorator';
import NoteModel from './note';
import { attr } from '@ember-data/model';

@classic
export default class ChangelogEntryModel extends NoteModel {
  @attr('boolean', {defaultValue: true }) changelog;
}
