import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { concat } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { eq } from 'ember-truth-helpers';
import FormNote from 'pixeditor/components/form/note';
import ListNotes from 'pixeditor/components/list/notes';

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

  @tracked currentTabId = 'tab1';

  constructor(...args) {
    super(...args);
    this.args.challenge
      .hasMany('notes')
      .load()
      .then(() => {
        this.notesLoaded = true;
      });
    this.args.challenge
      .hasMany('changelogEntries')
      .load()
      .then(() => {
        this.changelogLoaded = true;
      });
  }

  get title() {
    return this.args.challenge ? `Journal de ${this.args.challenge.skillName}` : 'no_title';
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
    await Promise.all([
      this.args.challenge.hasMany('notes').reload(),
      this.args.challenge.hasMany('changelogEntries').reload(),
    ]);
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
    this.mayEditEntry = note.author === this.config.author;
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
  onTabClick(e) {
    const tabId = e.target.id;
    if (tabId !== this.currentTabId) {
      this.currentTabId = tabId;
    }
  }

  <template>
    <PixModal @title={{this.title}} @onCloseButtonClick={{@close}} @showModal={{@showModal}}>
      <:content>
        {{#if this.list}}
          <div role="tablist" aria-label="Liste des notes" class="challenge-log__tabs">
            <button
              role="tab"
              class="{{if (eq this.currentTabId 'tab1') 'active' ''}}"
              aria-selected={{eq this.currentTabId "tab1"}}
              aria-controls="tabpanel1"
              id="tab1"
              type="button"
              {{on "click" this.onTabClick}}
            >Mes notes</button>
            <button
              role="tab"
              class="{{if (eq this.currentTabId 'tab2') 'active' ''}}"
              aria-selected={{eq this.currentTabId "tab2"}}
              aria-controls="tabpanel2"
              id="tab2"
              type="button"
              {{on "click" this.onTabClick}}
            >Toutes les notes</button>
            <button
              role="tab"
              class="{{if (eq this.currentTabId 'tab3') 'active' ''}}"
              aria-selected={{eq this.currentTabId "tab3"}}
              aria-controls="tabpanel3"
              id="tab3"
              type="button"
              {{on "click" this.onTabClick}}
            >Changelog</button>
          </div>

          <div
            id="tabpanel1"
            role="tabpanel"
            tabindex="0"
            aria-labelledby="tab1"
            class="{{if (eq this.currentTabId 'tab1') '' 'hidden'}}"
            data-tab="notes"
          >
            <ListNotes
              @list={{this.ownNotes}}
              @displayAuthor={{false}}
              @show={{this.showOwnNote}}
              @caption={{concat "Mes notes sur l’épreuve de " @challenge.skillName}}
            />
            <div class="ui text menu note-menu">
              <PixButton @triggerAction={{this.addNote}} @variant="tertiary" @size="small" @iconBefore="add">
                Nouvelle note
              </PixButton>
            </div>
          </div>
          <div
            id="tabpanel2"
            role="tabpanel"
            tabindex="0"
            aria-labelledby="tab2"
            class="{{if (eq this.currentTabId 'tab2') '' 'hidden'}}"
            data-tab="notes"
          >
            <ListNotes
              @list={{this.notes}}
              @show={{this.showNote}}
              @caption={{concat "Toutes les notes sur l’épreuve de " @challenge.skillName}}
            />
          </div>
          <div
            id="tabpanel3"
            role="tabpanel"
            tabindex="0"
            aria-labelledby="tab3"
            class="{{if (eq this.currentTabId 'tab3') '' 'hidden'}}"
            data-tab="notes"
          >
            <ListNotes
              @list={{this.changelogEntries}}
              @displayStatus={{false}}
              @show={{this.showChangelogEntry}}
              @caption={{concat "Changelog de l’épreuve de " @challenge.skillName}}
            />
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
