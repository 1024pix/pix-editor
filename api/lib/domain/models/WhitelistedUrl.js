import { CommandWhitelistedUrlConflictError, CommandWhitelistedUrlForbiddenError, } from '../errors.js';

export class WhitelistedUrl {
  constructor({
    id,
    createdBy,
    latestUpdatedBy,
    deletedBy,
    createdAt,
    updatedAt,
    deletedAt,
    url,
    relatedSkillNames,
    comment,
    checkType,
  }) {
    this.id = id;
    this.createdBy = createdBy;
    this.latestUpdatedBy = latestUpdatedBy;
    this.deletedBy = deletedBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.url = url;
    this.relatedSkillNames = relatedSkillNames;
    this.comment = comment;
    this.checkType = checkType;
  }
  static get CHECK_TYPES() {
    return {
      EXACT_MATCH: 'exact_match',
      STARTS_WITH: 'starts_with',
    };
  }

  canDelete(user) {
    if (!user.isAdmin) throw new CommandWhitelistedUrlForbiddenError('L\'utilisateur n\'a pas les droits pour supprimer cette URL whitelistée');
    if (this.deletedAt) throw new CommandWhitelistedUrlConflictError('L\'URL whitelistée a déjà été supprimée');
  }

  delete(user) {
    const operationDate = new Date();
    this.latestUpdatedBy = user.id;
    this.deletedBy = user.id;
    this.updatedAt = operationDate;
    this.deletedAt = operationDate;
  }
}
