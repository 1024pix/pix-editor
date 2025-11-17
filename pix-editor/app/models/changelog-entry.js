import { inject as service } from '@ember/service';
import Model, { attr } from '@ember-data/model';

export default class ChangelogEntryModel extends Model {
  @service changelogEntry;

  @attr text;
  @attr elementId;
  @attr author;
  @attr createdAt;
  @attr status;
  @attr elementType;
  @attr action;

  get date() {
    return new Date(this.createdAt).toLocaleDateString('fr');
  }

  get actionCSS() {
    const changelogEntry = this.changelogEntry;
    switch (this.action) {
      case changelogEntry.deleteAction:
        return 'delete-log';
      case changelogEntry.createAction:
        return 'create-log';
      case changelogEntry.archiveAction:
        return 'archive-log';
      case changelogEntry.modifyAction:
        return 'modify-log';
      case changelogEntry.moveAction:
        return 'move-log';
      default:
        return '';
    }
  }
}
