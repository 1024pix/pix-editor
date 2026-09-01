import Service, { service } from '@ember/service';

export const READ_PIX_ONLY = 0;
export const READ_ONLY = 1;
export const REPLICATOR = 2;
export const EDITOR = 3;
export const ADMIN = 4;

export default class AccessService extends Service {
  @service config;

  readOnly = READ_ONLY;

  isReadonly() {
    const level = this.config.accessLevel;
    return level === READ_ONLY;
  }

  mayCreatePrototype() {
    return this.isEditor();
  }

  mayCreateTube() {
    return this.isEditor();
  }

  mayCreateTheme() {
    return this.isEditor();
  }

  mayEditSkills() {
    return this.isEditor();
  }

  mayEditSkill(skill) {
    return this.mayEditSkills() && !skill.isObsolete;
  }

  mayMoveTube(tube) {
    const level = this.config.accessLevel;
    if (tube.hasProductionSkills) {
      return level === ADMIN;
    } else {
      return level >= EDITOR;
    }
  }

  mayDuplicateSkill(skill) {
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

  mayObsoleteSkill(skill) {
    if (skill.isObsolete) {
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
    const production = challenge.get('isValidated');
    const obsolete = challenge.get('isObsolete');
    const prototype = challenge.get('isPrototype');
    if (obsolete) {
      return false;
    }
    return level >= EDITOR || (!production && !prototype && level === REPLICATOR);
  }

  get mayEditLocalized() {
    return this.config.accessLevel >= EDITOR;
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

  mayValidate(challenge) {
    return this.isAdmin() && challenge.isDraft && !challenge.isWorkbench;
  }

  mayValidateQuality(challenge) {
    if (challenge.isQualityOk) return false;
    return this.isEditor() && challenge.isValidated;
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

  mayObsolete(challenge) {
    if (challenge.isObsolete) {
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
    return this.isEditor() && challenge.isPrototype && challenge.isDraft;
  }

  maySwitchGenealogy(challenge) {
    return this.isAdmin() && challenge.isValidated && challenge.isAlternative;
  }

  mayAccessAdministration() {
    return this.isAdmin();
  }

  mayAccessStaticCourses() {
    const level = this.config.accessLevel;
    return level >= READ_ONLY;
  }

  mayAccessBrokenUrls() {
    return this.isEditor();
  }

  mayAccessWhitelistedUrls() {
    return this.isEditor();
  }

  mayCreateOrEditWhitelistedUrl() {
    return this.isEditor();
  }

  mayCreateOrEditStaticCourse() {
    return this.isEditor();
  }

  mayCreateOrEditMission() {
    return this.isEditor();
  }

  mayChangeLocalizedChallengeStatus(localizedChallenge) {
    return this.isAdmin() && localizedChallenge.isStatusEditable;
  }

  isReadOnly() {
    const level = this.config.accessLevel;
    return level >= READ_ONLY;
  }

  isReplicator() {
    const level = this.config.accessLevel;
    return level >= REPLICATOR;
  }

  isEditor() {
    const level = this.config.accessLevel;
    return level >= EDITOR;
  }

  isAdmin() {
    const level = this.config.accessLevel;
    return level === ADMIN;
  }

  getLevel(accessString) {
    switch (accessString) {
      case 'readpixonly':
        return READ_PIX_ONLY;
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
