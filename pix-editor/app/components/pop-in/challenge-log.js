import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

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

  notes = A([]);
  changelogEntries = A([]);

  constructor() {
    super (...arguments);
    this._loadNotes();
    this._loadChangelog();
  }

  get title() {
    return this.args.challenge
      ? `Journal de ${this.args.challenge.skillName}`
      : 'no_title';
  }

  get ownNotes() {
    if (!this.notesLoaded) {
      return [];
    } else {
      const notes = this.notes;
      const author = this.config.author;
      return notes.filter(note => note.author === author);
    }
  }

  get ownCount() {
    return this.ownNotes.length;
  }

  get notesCount() {
    return this.notes.length;
  }

  get changelogEntriesCount() {
    return this.changelogEntries.length;
  }

  @action
  addNote() {
    const newNote = this.store.createRecord('note', {
      recordId: this.args.challenge.id,
      author: this.config.author,
      elementType: this.changelogEntry.challenge
    });
    this.logEntry = newNote;
    this.list = false;
    this.logEntryEdition = true;
  }

  @action
  saveEntry() {
    const entry = this.logEntry;
    if (!entry.id) {
      entry.createdAt = (new Date()).toISOString();
    }
    entry.save()
      .then(() => {
        this.list = true;
        this._loadNotes();
        this._loadChangelog();
      });
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

  @action
  close() {
    this.notesLoaded = false;
    this.changelogLoaded = false;
    this.notes = A([]);
    this.changelogEntries = A([]);
    this.args.close();
  }

  _loadNotes() {
    this.notesLoaded = false;
    const challenge = this.args.challenge;
    if (challenge) {
      const pq = this.paginatedQuery;
      return pq.query('note', { filterByFormula:`AND(Record_Id = '${challenge.id}', Statut != 'archive', Changelog='non')`, sort: [{ field: 'Date', direction: 'desc' }] })
        .then(notes => {
          this.notes = notes;
          this.notesLoaded = true;
          return notes;
        });
    }
  }

  _loadChangelog() {
    this.changelogLoaded = false;
    const challenge = this.args.challenge;
    if (challenge) {
      const pq = this.paginatedQuery;
      return pq.query('changelogEntry', { filterByFormula:`AND(Record_Id = '${challenge.id}', Changelog='oui')`, sort: [{ field: 'Date', direction: 'desc' }] })
        .then(entries => {
          this.changelogEntries = entries;
          this.changelogLoaded = true;
        });
    }
  }
}
