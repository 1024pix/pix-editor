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
    const level = this.config.accessLevel;
    return (level === READ_ONLY);
  }

  mayCreatePrototype() {
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
    const level = this.config.accessLevel;
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
    const level = this.config.accessLevel;
    if (skill.productionPrototype) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayArchiveSkill(skill) {
    if (!skill.isLive) {
      return false;
    }
    const level = this.config.accessLevel;
    if (skill.productionPrototype) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayDeleteSkill(skill) {
    if (skill.isDeleted) {
      return false;
    }
    const level = this.config.accessLevel;
    if (skill.productionPrototype) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayCreateAlternative() {
    return this.isReplicator();
  }

  mayEdit(challenge) {
    const level = this.config.accessLevel;
    const production = challenge.isValidated;
    const archived = challenge.isArchived;
    const deleted = challenge.isDeleted;
    const prototype = challenge.isPrototype;
    return !(archived || deleted) && (level === ADMIN || (!production && (level === EDITOR || (level === REPLICATOR && !prototype))));
  }

  mayDuplicate(challenge) {
    const level = this.config.accessLevel;
    const prototype = challenge.isPrototype;
    return level >= EDITOR || (!prototype && level === REPLICATOR);
  }

  mayAccessLog(challenge) {
    const level = this.config.accessLevel;
    const prototype = challenge.isPrototype;
    return level >= EDITOR || (!prototype && level === REPLICATOR);
  }

  mayAccessAirtable() {
    return this.isAdmin();
  }

  mayValidate(challenge) {
    return this.isAdmin() && challenge.isDraft && !challenge.isWorkbench;
  }

  mayArchive(challenge) {
    if (!challenge.isLive) {
      return false;
    }
    const level = this.config.accessLevel;
    if (challenge.isValidated) {
      return level === ADMIN;
    } else {
      if (challenge.isPrototype) {
        return level >= EDITOR;
      } else {
        return level >= REPLICATOR;
      }
    }
  }

  mayDelete(challenge) {
    if (challenge.isDeleted) {
      return false;
    }
    const level = this.config.accessLevel;
    if (challenge.isValidated) {
      return level === ADMIN;
    } else {
      if (challenge.isPrototype) {
        return level >= EDITOR;
      } else {
        return level >= REPLICATOR;
      }
    }
  }

  mayMove(challenge) {
    return this.isAdmin() && challenge.isPrototype && challenge.isDraft;
  }

  isReplicator() {
    const level = this.config.accessLevel;
    return (level >= REPLICATOR);
  }

  isEditor() {
    const level = this.config.accessLevel;
    return (level >= EDITOR);
  }

  isAdmin() {
    const level = this.config.accessLevel;
    return (level === ADMIN);
  }

  getLevel(accessString) {
    switch (accessString) {
      case 'readonly':
        return READ_ONLY;
      case 'replicator':
        return REPLICATOR;
      case 'editor':
        return EDITOR;
      case 'admin':
        return ADMIN;
    }
  }
}
