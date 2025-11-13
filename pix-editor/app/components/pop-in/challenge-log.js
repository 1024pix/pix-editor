import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PopinChallengeLog extends Component {
  @service store;
  @service paginatedQuery;
  @service config;
  @service changelogEntry;

  @tracked notesLoaded = false;
  @tracked changelogLoaded = false;

  @tracked logEntry = null;
  @tracked logEntryEdition = false;
  @tracked list = true;
  @tracked mayEditEntry = false;

  constructor(...args) {
    super(...args);
    this.args.challenge.hasMany('notes').load().then(() => {
      this.notesLoaded = true;
    });
    this.args.challenge.hasMany('changelogEntries').load().then(() => {
      this.changelogLoaded = true;
    });
  }

  get title() {
    return this.args.challenge
      ? `Journal de ${this.args.challenge.skillName}`
      : 'no_title';
  }

  get notes() {
    if (!this.notesLoaded) return [];
    return this.args.challenge.hasMany('notes').value() ?? [];
  }

  get ownNotes() {
    if (!this.notesLoaded) return [];
    const notes = this.notes;
    const author = this.config.author;
    return notes.filter((note) => note.author === author);
  }

  get ownCount() {
    return this.ownNotes.length;
  }

  get notesCount() {
    return this.notes.length;
  }

  get changelogEntries() {
    if (!this.changelogLoaded) return [];
    return this.args.challenge.hasMany('changelogEntries').value();
  }

  get changelogEntriesCount() {
    return this.changelogEntries.length;
  }

  @action
  addNote() {
    const newNote = this.store.createRecord('note', {
      challengeId: this.args.challenge.id,
      author: this.config.author,
    });
    this.logEntry = newNote;
    this.list = false;
    this.logEntryEdition = true;
  }

  @action
  async saveEntry() {
    await this.logEntry.save();

    this.list = true;
    await Promise.all([this.args.challenge.hasMany('notes').reload(), this.args.challenge.hasMany('changelogEntries').reload()]);
  }

  @action
  closeLogForm() {
    this.list = true;
  }

  @action
  showOwnNote(note) {
    this.logEntryEdition = false;
    this.logEntry = note;
    this.mayEditEntry = true;
    this.list = false;
  }

  @action
  showNote(note) {
    this.logEntryEdition = false;
    this.logEntry = note;
    this.mayEditEntry = (note.author === this.config.author);
    this.list = false;
  }

  @action
  showChangelogEntry(entry) {
    this.logEntryEdition = false;
    this.logEntry = entry;
    this.mayEditEntry = false;
    this.list = false;
  }

  @action
  editEntry() {
    this.logEntryEdition = true;
  }
}
