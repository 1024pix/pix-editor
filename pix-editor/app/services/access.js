import Service from '@ember/service';
import {inject as service} from '@ember/service';

const READ_ONLY = 1;
const REPLICATOR = 2;
const EDITOR = 3;
const ADMIN = 4;


export default class AccessService extends Service {
  @service config;

  readOnly = READ_ONLY;

  isReadonly() {
    let level = this.config.access;
    return (level === READ_ONLY);
  }

  mayCreateTemplate() {
    return this.isEditor();
  }

  mayCreateTube() {
    return this.isEditor();
  }

  mayEditSkills() {
    return this.isEditor();
  }

  mayMoveTube(tube) {
    let level = this.config.access;
    if (tube.hasProductionChallenge) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayMoveSkill(skill) {
    let level = this.config.access;
    if (skill.productionTemplate) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayArchiveSkill(skill) {
    let level = this.config.access;
    if (skill.productionTemplate) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayCreateAlternative() {
    return this.isReplicator();
  }

  mayEdit(challenge) {
    let level = this.config.access;
    let production = challenge.isValidated;
    let archived = challenge.isArchived;
    let template = challenge.isTemplate;
    return !archived && (level === ADMIN || (!production && (level === EDITOR || (level === REPLICATOR && !template))));
  }

  mayDuplicate(challenge) {
    let level = this.config.access;
    let template = challenge.isTemplate;
    return level >= EDITOR || (!template && level === REPLICATOR);
  }

  mayAccessLog(challenge) {
    let level = this.config.access;
    let template = challenge.isTemplate;
    return level >= EDITOR || (!template && level === REPLICATOR);
  }

  mayAccessAirtable() {
    return this.isAdmin();
  }

  mayValidate(challenge) {
    let production = challenge.isValidated;
    let archived = challenge.isArchived;
    let workbench = challenge.isWorkbench;
    return this.isAdmin() && !production && !archived && !workbench;
  }

  mayArchive(challenge) {
    return this.mayEdit(challenge);
  }

  mayMove(challenge) {
    return this.isAdmin() && challenge.isTemplate && challenge.isSuggested;
  }

  isReplicator() {
    let level = this.config.access;
    return (level >= REPLICATOR);
  }

  isEditor() {
    let level = this.config.access;
    return (level >= EDITOR);
  }

  isAdmin() {
    let level = this.config.access;
    return (level === ADMIN);
  }

  getLevel(accessString) {
    switch (accessString) {
      case 'lecture':
        return READ_ONLY;
      case 'réplication':
        return REPLICATOR;
      case 'rédaction':
        return EDITOR;
      case 'admin':
        return ADMIN;
    }
  }
}
