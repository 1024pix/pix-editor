import Service from '@ember/service';
import { inject as service } from '@ember/service';

const READ_ONLY = 1;
const REPLICATOR = 2;
const EDITOR = 3;
const ADMIN = 4;


export default class AccessService extends Service {
  @service config;

  readOnly = READ_ONLY;

  isReadonly() {
    const level = this.config.access;
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

  mayEditSkill(skill) {
    return this.mayEditSkills() && skill.isLive;
  }

  mayMoveTube(tube) {
    const level = this.config.access;
    if (tube.hasProductionChallenge) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayMoveSkill(skill) {
    if (!skill.isLive) {
      return false;
    }
    const level = this.config.access;
    if (skill.productionTemplate) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayArchiveSkill(skill) {
    if (!skill.isLive) {
      return false;
    }
    const level = this.config.access;
    if (skill.productionTemplate) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayDeleteSkill(skill) {
    if (skill.isDeleted) {
      return false;
    }
    const level = this.config.access;
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
    const level = this.config.access;
    const production = challenge.isValidated;
    const archived = challenge.isArchived;
    const deleted = challenge.isDeleted;
    const template = challenge.isTemplate;
    return !(archived || deleted) && (level === ADMIN || (!production && (level === EDITOR || (level === REPLICATOR && !template))));
  }

  mayDuplicate(challenge) {
    const level = this.config.access;
    const template = challenge.isTemplate;
    return level >= EDITOR || (!template && level === REPLICATOR);
  }

  mayAccessLog(challenge) {
    const level = this.config.access;
    const template = challenge.isTemplate;
    return level >= EDITOR || (!template && level === REPLICATOR);
  }

  mayAccessAirtable() {
    return this.isAdmin();
  }

  mayValidate(challenge) {
    const production = challenge.isValidated;
    const archived = challenge.isArchived;
    const deleted = challenge.isDeleted;
    const workbench = challenge.isWorkbench;
    return this.isAdmin() && !production && !archived && !workbench && !deleted;
  }

  mayArchive(challenge) {
    return this.mayEdit(challenge);
  }

  mayDelete(challenge) {
    return this.mayEdit(challenge);
  }

  mayMove(challenge) {
    return this.isAdmin() && challenge.isTemplate && challenge.isDraft;
  }

  isReplicator() {
    const level = this.config.access;
    return (level >= REPLICATOR);
  }

  isEditor() {
    const level = this.config.access;
    return (level >= EDITOR);
  }

  isAdmin() {
    const level = this.config.access;
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
