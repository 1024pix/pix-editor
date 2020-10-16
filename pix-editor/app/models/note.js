import Model, { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';

export default class NoteModel extends Model {

  @service changelogEntry

  @attr text;
  @attr recordId;
  @attr author;
  @attr createdAt;
  @attr status;
  @attr elementType;
  @attr skillName;
  @attr action;
  @attr('boolean', { defaultValue: false }) changelog;

  get date() {
    const createdDate = this.createdAt;
    return (new Date(createdDate)).toLocaleDateString('fr');
  }

  get actionCSS() {
    const changelogEntry = this.changelogEntry;
    switch (this.action) {
      case changelogEntry.deleteAction :
        return 'delete-log';
      case changelogEntry.createAction :
        return 'create-log';
      case changelogEntry.archiveAction :
        return 'archive-log';
      case changelogEntry.modifyAction :
        return 'modify-log';
      case changelogEntry.moveAction :
        return 'move-log';
      default:
        return '';
    }
  }
}
