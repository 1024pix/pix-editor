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

  _notes = A([]);
  _entries = A([]);

  get notes() {
    if (!this.notesLoaded) {
      return this._loadNotes();
    }
    return this._notes;
  }

  get ownNotes() {
    if (!this.notesLoaded) {
      this._loadNotes();
      // wait for notes to be loaded
      return [];
    } else {
      const notes = this.notes;
      const author = this.config.author;
      return notes.filter(note => note.author === author);
    }
  }

  get changelogEntries() {
    if (!this.changelogLoaded) {
      const challenge = this.args.challenge;
      if (challenge) {
        const pq = this.paginatedQuery;
        return pq.query('changelogEntry', { filterByFormula:`AND(Record_Id = '${challenge.pixId}', Changelog='oui')`, sort: [{ field: 'Date', direction: 'desc' }] })
          .then(entries => {
            this._entries = entries;
            this.changelogLoaded = true;
            return entries;
          });
      }
    }
    return this._entries;
  }

  get ownCount() {
    if (this.notesLoaded) {
      return this.ownNotes.length;
    }
    return 0;
  }

  get notesCount() {
    if (this.notesLoaded) {
      return this.notes.length;
    }
    return 0;
  }

  get changelogEntriesCount() {
    if (this.changelogLoaded) {
      return this.changelogEntries.length;
    }
    return 0;
  }

  @action
  addNote() {
    const newNote = this.store.createRecord('note', {
      recordId:this.args.challenge.pixId,
      author:this.config.author,
      elementType:this.changelogEntry.challenge
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
        this.changelogLoaded = false;
        this.notesLoaded = false;
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
    this._notes = A([]);
    this._entries = A([]);
    this.args.close();
  }

  _loadNotes() {
    const challenge = this.args.challenge;
    if (challenge) {
      const pq = this.paginatedQuery;
      return pq.query('note', { filterByFormula:`AND(Record_Id = '${challenge.pixId}', Statut != 'archive', Changelog='non')`, sort: [{ field: 'Date', direction: 'desc' }] })
        .then(notes => {
          this._notes = notes;
          this.notesLoaded = true;
          return notes;
        });
    }
  }
}
