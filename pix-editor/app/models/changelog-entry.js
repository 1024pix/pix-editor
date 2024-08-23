import { attr } from '@ember-data/model';

import NoteModel from './note';

export default class ChangelogEntryModel extends NoteModel {
  @attr('boolean', { defaultValue: true }) changelog;
}
