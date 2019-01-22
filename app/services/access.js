import Service from '@ember/service';
import {inject as service} from '@ember/service';

const READ_ONLY = 1;
const REPLICATOR = 2;
const EDITOR = 3;
const ADMIN = 4;


export default Service.extend({
  config:service(),
  readOnly:READ_ONLY,
  isReadonly() {
    let level = this.get("config.access");
    return (level === READ_ONLY);
  },
  mayCreateTemplate() {
    return this.isEditor();
  },
  mayCreateTube() {
    return this.isEditor();
  },
  mayEditTube() {
    return this.isEditor();
  },
  mayCreateAlternative() {
    return this.isReplicator();
  },
  mayEdit(challenge) {
    let level = this.get("config.access");
    let production = challenge.get("isValidated");
    let archived = challenge.get("isArchived");
    let template = challenge.get("isTemplate");
    return !archived && (level === ADMIN || (!production && (level === EDITOR || (level === REPLICATOR && !template))));
  },
  mayDuplicate(challenge) {
    let level = this.get("config.access");
    let template = challenge.get("isTemplate");
    return level >= EDITOR || (!template && level === REPLICATOR);
  },
  mayAccessLog(challenge) {
    let level = this.get("config.access");
    let template = challenge.get("isTemplate");
    return level >= EDITOR || (!template && level === REPLICATOR);
  },
  mayAccessAirtable() {
    return this.isAdmin();
  },
  mayValidate(challenge) {
    let production = challenge.get("isValidated");
    let archived = challenge.get("isArchived");
    let workbench = challenge.get("isWorkbench.content");
    return this.isAdmin() && !production && !archived && !workbench;
  },
  mayArchive(challenge) {
    return this.mayEdit(challenge);
  },
  isReplicator() {
    let level = this.get("config.access");
    return (level >= REPLICATOR);
  },
  isEditor() {
    let level = this.get("config.access");
    return (level >= EDITOR);
  },
  isAdmin() {
    let level = this.get("config.access");
    return (level === ADMIN);
  },
  getLevel(accessString) {
    switch (accessString) {
      case "lecture":
        return READ_ONLY;
      case "réplication":
        return REPLICATOR;
      case "rédaction":
        return EDITOR;
      case "admin":
        return ADMIN;
    }
  }
});
