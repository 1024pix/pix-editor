import NoteModel from './note';
import { attr } from '@ember-data/model';

export default class ChangelogEntryModel extends NoteModel {
  @attr('boolean', { defaultValue: true }) changelog;
}
