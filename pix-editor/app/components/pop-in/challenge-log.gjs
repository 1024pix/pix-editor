import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import AriaTabs from 'ember-aria-tabs';
import FormNote from '../../components/form/note';
import ListNotes from '../../components/list/notes';

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

  <template>
    <PixModal
      @title={{this.title}}
      @onCloseButtonClick={{@close}}
      @showModal={{@showModal}}
    >
      <:content>
        {{#if this.list}}
          <div class="ui content segment basic custom-tab">
            <AriaTabs as |at|>
              <div class="ui top attached tabular menu">
                <at.tabList as |tl|>
                  <tl.tab>Mes notes</tl.tab>
                  <tl.tab>Toutes les notes </tl.tab>
                  <tl.tab data-test-changelog-tab>Changelog</tl.tab>
                </at.tabList>
              </div>
              <at.tabPanel>
                <div class="ui bottom attached tab segment active {{unless this.notesLoaded "loading"}}" data-tab="own">
                  <ListNotes @list={{this.ownNotes}} @displayAuthor={{false}} @show={{this.showOwnNote}} />
                  <div class="ui text menu note-menu">
                    <button class="ui button item" {{on "click" this.addNote}} type="button"><i class="plus icon"></i>Nouvelle note</button>
                  </div>
                </div>
              </at.tabPanel>
              <at.tabPanel>
                <div class="ui bottom attached tab segment active {{unless this.notesLoaded "loading"}}" data-tab="notes">
                  <ListNotes @list={{this.notes}} @show={{this.showNote}} />
                </div>
              </at.tabPanel>
              <at.tabPanel>
                <div class="ui bottom attached tab segment active {{unless this.changelogLoaded "loading"}}" data-tab="notes">
                  <ListNotes @list={{this.changelogEntries}} @displayStatus={{false}} @show={{this.showChangelogEntry}} />
                </div>
              </at.tabPanel>
            </AriaTabs>
          </div>
        {{else}}
          <FormNote
            @entry={{this.logEntry}}
            @edition={{this.logEntryEdition}}
            @close={{this.closeLogForm}}
            @save={{this.saveEntry}}
            @mayEdit={{this.mayEditEntry}}
            @edit={{this.editEntry}}
          />
        {{/if}}
      </:content>
    </PixModal>
  </template>
}
