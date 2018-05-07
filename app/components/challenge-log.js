import Component from "@ember/component";
import { observer, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import DS from 'ember-data';
import $ from "jquery";

export default Component.extend({
  store:service(),
  paginatedQuery:service(),
  config:service(),
  logEntry:null,
  logEntryEdition:false,
  list:true,
  mayEditEntry:false,
  displayManager:observer("display", function() {
    if (this.get("display")) {
      $(".challenge-log").modal('show');
    }
  }),
  notes:computed("challenge", function() {
    let challenge = this.get("challenge");
    if (challenge) {
      let production = (challenge.get("workbench")?"non":"oui");
      let pq = this.get("paginatedQuery");
      return DS.PromiseArray.create({
        promise: pq.query("note", {filterByFormula:"AND(Record_Id = '"+challenge.get("id")+"', Production = '"+production+"', Statut != 'archive', Changelog='non')", sort: [{field: "Date", direction: "desc"}]})
      });
    } else {
      return [];
    }
  }),
  ownNotes:computed("notes.isFulfilled", function() {
    let notes = this.get("notes");
    if (notes.get("isFulfilled")) {
      let author = this.get("config").get("author");
      return notes.reduce((current, note) => {
        if (note.get("author") === author) {
          current.push(note);
        }
        return current;
      }, []);
    } else {
      return [];
    }
  }),
  changelogEntries:computed("challenge", function() {
    let challenge = this.get("challenge");
    let pq = this.get("paginatedQuery");
    if (challenge) {
      let production = (challenge.get("workbench")?"non":"oui");
      return DS.PromiseArray.create({
        promise:pq.query("changelogEntry", {filterByFormula:"AND(Record_Id = '"+challenge.get("id")+"', Production = '"+production+"', Statut != 'archive', Changelog='oui')", sort: [{field: "Date", direction: "desc"}]})
      });
    } else {
      return [];
    }
  }),
  loading:computed("changelogEntries.isPending", "notes.isPending", function() {
    let entries = this.get("changelogEntries");
    let notes = this.get("notes");
    return entries.get("isPending") || notes.get("isPending");
  }),
  ownCount:computed("ownNotes", function() {
    return this.get("ownNotes").length;
  }),
  notesCount:computed("notes.isFulfilled", function() {
    if (this.get("notes.isFulfilled")) {
      return this.get("notes.length");
    } else {
      return 0;
    }
  }),
  changelogEntriesCount:computed("changelogEntries.isFulfilled", function() {
    if (this.get("changelogEntries.isFulfilled")) {
      return this.get("changelogEntries.length");
    } else {
      return 0;
    }
  }),
  didRender() {
    this._super(...arguments);
    $('.challenge-log .menu .item').tab();
  },
  actions: {
    addNote() {
      let newNote = this.get("store").createRecord("note", {
        challengeId:this.get("challenge.id"),
        author:this.get("config").get("author"),
        competence:this.get("competence.code"),
        skills:this.get("challenge.joinedSkills"),
        production:!this.get("challenge.workbench")
      });
      this.set("logEntry", newNote);
      this.set("list", false);
      this.set("logEntryEdition", true);
    },
    update() {
      this.set("list", true);
      this.notifyPropertyChange("challenge");
    },
    closeLogForm() {
      this.set("list", true);
    },
    showOwnNote(note) {
      this.set("logEntryEdition", false);
      this.set("logEntry", note);
      this.set("mayEditEntry", true);
      this.set("list", false);
    },
    showNote(note) {
      this.set("logEntryEdition", false);
      this.set("logEntry", note);
      this.set("mayEditEntry", (note.get("author") == this.get("config.author")));
      this.set("list", false);
    },
    showChangelogEntry(entry) {
      this.set("logEntryEdition", false);
      this.set("logEntry", entry);
      this.set("mayEditEntry", false);
      this.set("list", false);
    },
    editEntry() {
      this.set("logEntryEdition", true);
    }
  }
});
