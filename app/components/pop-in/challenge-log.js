import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DS from 'ember-data';

@classic
export default class PopinChallengeLog extends Component {
  @service
  store;

  @service
  paginatedQuery;

  @service
  config;

  logEntry = null;
  logEntryEdition = false;
  list = true;
  mayEditEntry = false;

  @computed('challenge')
  get notes() {
    let challenge = this.get('challenge');
    if (challenge) {
      let production = (challenge.get('workbench')?'non':'oui');
      let pq = this.get('paginatedQuery');
      return DS.PromiseArray.create({
        promise: pq.query('note', {filterByFormula:`AND(Record_Id = '${challenge.get('id')}', Production = '${production}', Statut != 'archive', Changelog='non')`, sort: [{field: 'Date', direction: 'desc'}]})
      });
    } else {
      return [];
    }
  }

  @computed('notes.isFulfilled')
  get ownNotes() {
    let notes = this.get('notes');
    if (notes.get('isFulfilled')) {
      let author = this.get('config').get('author');
      let test = notes.filter(note => note.get('author') == author);
      return test;
    } else {
      return [];
    }
  }

  @computed('challenge')
  get changelogEntries() {
    let challenge = this.get('challenge');
    let pq = this.get('paginatedQuery');
    if (challenge) {
      let production = (challenge.get('workbench')?'non':'oui');
      return DS.PromiseArray.create({
        promise:pq.query('changelogEntry', {filterByFormula:`AND(Record_Id = '${challenge.get('id')}', Production = '${production}', Statut != 'archive', Changelog='oui')`, sort: [{field: 'Date', direction: 'desc'}]})
      });
    } else {
      return [];
    }
  }

  @computed('changelogEntries.isPending', 'notes.isPending')
  get loading() {
    let entries = this.get('changelogEntries');
    let notes = this.get('notes');
    return entries.get('isPending') || notes.get('isPending');
  }

  @computed('ownNotes')
  get ownCount() {
    return this.get('ownNotes').length;
  }

  @computed('notes.isFulfilled')
  get notesCount() {
    if (this.get('notes.isFulfilled')) {
      return this.get('notes.length');
    } else {
      return 0;
    }
  }

  @computed('changelogEntries.isFulfilled')
  get changelogEntriesCount() {
    if (this.get('changelogEntries.isFulfilled')) {
      return this.get('changelogEntries.length');
    } else {
      return 0;
    }
  }

  @action
  addNote() {
    let newNote = this.get('store').createRecord('note', {
      challengeId:this.get('challenge.pixId'),
      author:this.get('config').get('author'),
      competence:this.get('competence.code'),
      skills:this.get('challenge.joinedSkills'),
      production:!this.get('challenge.workbench')
    });
    this.set('logEntry', newNote);
    this.set('list', false);
    this.set('logEntryEdition', true);
  }

  @action
  saveEntry() {
    const entry = this.get('logEntry');
    if (!entry.get('id')) {
      entry.set('createdAt', (new Date()).toISOString());
    }
    entry.save()
    .then(() => {
      this.set('list', true);
      this.notifyPropertyChange('challenge');
    });
  }

  @action
  closeLogForm() {
    this.set('list', true);
  }

  @action
  showOwnNote(note) {
    this.set('logEntryEdition', false);
    this.set('logEntry', note);
    this.set('mayEditEntry', true);
    this.set('list', false);
  }

  @action
  showNote(note) {
    this.set('logEntryEdition', false);
    this.set('logEntry', note);
    this.set('mayEditEntry', (note.get('author') == this.get('config.author')));
    this.set('list', false);
  }

  @action
  showChangelogEntry(entry) {
    this.set('logEntryEdition', false);
    this.set('logEntry', entry);
    this.set('mayEditEntry', false);
    this.set('list', false);
  }

  @action
  editEntry() {
    this.set('logEntryEdition', true);
  }

  @action
  closeModal() {
    this.set('display', false);
  }
}
