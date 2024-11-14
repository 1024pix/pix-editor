import {
  CommandWhitelistedUrlConflictError,
  CommandWhitelistedUrlError,
  CommandWhitelistedUrlForbiddenError,
  NotFoundWhitelistedUrlError,
} from '../errors.js';

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

  get isActive() {
    return this.deletedAt === null;
  }

  static canCreate(creationCommand, user, existingWhitelistedUrls) {
    const activeExistingWhitelistedUrls = existingWhitelistedUrls.filter((whitelistedUrl) => whitelistedUrl.isActive);
    if (!user.isAdmin) throw new CommandWhitelistedUrlForbiddenError('L\'utilisateur n\'a pas les droits pour créer une URL whitelistée');
    if (!isUrlValid(creationCommand.url)) throw new CommandWhitelistedUrlError({ message: 'URL invalide', attribute: 'url' });
    if (!isRelatedSkillNamesValid(creationCommand.relatedSkillNames)) throw new CommandWhitelistedUrlError({ message: 'Liste d\'acquis invalide. Doit être une suite d\'acquis séparés par des virgules ou vide', attribute: 'relatedSkillNames' });
    if (!isCommentValid(creationCommand.comment)) throw new CommandWhitelistedUrlError({ message: 'Commentaire invalide. Doit être un texte ou vide', attribute: 'comment' });
    if (!isCheckTypeValid(creationCommand.checkType)) throw new CommandWhitelistedUrlError({ message: `Type de check invalide. Valeurs parmi : ${Object.values(WhitelistedUrl.CHECK_TYPES).join(', ')}`, attribute: 'checkType' });
    if (!isUrlUnique(creationCommand.url, activeExistingWhitelistedUrls)) throw new CommandWhitelistedUrlConflictError('URL déjà whitelistée');
  }

  static create(creationCommand, user) {
    const operationDate = new Date();
    return new WhitelistedUrl({
      id: null,
      createdBy: user.id,
      latestUpdatedBy: user.id,
      deletedBy: null,
      createdAt: operationDate,
      updatedAt: operationDate,
      deletedAt: null,
      url: creationCommand.url,
      relatedSkillNames: creationCommand.relatedSkillNames,
      comment: creationCommand.comment,
      checkType: creationCommand.checkType,
    });
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

  canUpdate(updateCommand, user, existingWhitelistedUrls) {
    const activeOtherExistingWhitelistedUrls = existingWhitelistedUrls.filter((whitelistedUrl) => whitelistedUrl.isActive && whitelistedUrl.id !== this.id);
    if (!user.isAdmin) throw new CommandWhitelistedUrlForbiddenError('L\'utilisateur n\'a pas les droits pour mettre à jour cette URL whitelistée');
    if (this.deletedAt) throw new NotFoundWhitelistedUrlError('L\'URL whitelistée n\'existe pas');
    if (!isUrlValid(updateCommand.url)) throw new CommandWhitelistedUrlError({ message: 'URL invalide', attribute: 'url' });
    if (!isRelatedSkillNamesValid(updateCommand.relatedSkillNames)) throw new CommandWhitelistedUrlError({ message: 'Liste d\'acquis invalide. Doit être une suite d\'acquis séparés par des virgules ou vide', attribute: 'relatedSkillNames' });
    if (!isCommentValid(updateCommand.comment)) throw new CommandWhitelistedUrlError({ message: 'Commentaire invalide. Doit être un texte ou vide', attribute: 'comment' });
    if (!isCheckTypeValid(updateCommand.checkType)) throw new CommandWhitelistedUrlError({ message: `Type de check invalide. Valeurs parmi : ${Object.values(WhitelistedUrl.CHECK_TYPES).join(', ')}`, attribute: 'checkType' });
    if (!isUrlUnique(updateCommand.url, activeOtherExistingWhitelistedUrls)) throw new CommandWhitelistedUrlConflictError('URL déjà whitelistée');
  }

  update(updateCommand, user) {
    const operationDate = new Date();
    this.latestUpdatedBy = user.id;
    this.updatedAt = operationDate;
    this.url = updateCommand.url;
    this.relatedSkillNames = updateCommand.relatedSkillNames;
    this.comment = updateCommand.comment;
    this.checkType = updateCommand.checkType;
  }

  matches(url) {
    if (this.checkType === WhitelistedUrl.CHECK_TYPES.EXACT_MATCH) return url === this.url;
    if (this.checkType === WhitelistedUrl.CHECK_TYPES.STARTS_WITH) return url.startsWith(this.url);
    return false;
  }
}

function isUrlValid(url) {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
}

function isRelatedSkillNamesValid(relatedSkillNames) {
  const skillsSeparatedByCommaRegex = /^(@[A-Za-z]+[0-9])(,(@[A-Za-z]+[0-9]))*/;
  if (!relatedSkillNames) return true;
  return skillsSeparatedByCommaRegex.test(relatedSkillNames);
}

function isCommentValid(comment) {
  if (comment == null) return true;
  return typeof comment === 'string';
}

function isCheckTypeValid(checkType) {
  if (typeof checkType === 'string') return Object.values(WhitelistedUrl.CHECK_TYPES).includes(checkType);
  return false;
}

function isUrlUnique(url, existingWhitelistedUrls) {
  return existingWhitelistedUrls.every((whitelistedUrl) => whitelistedUrl.url !== url);
}
