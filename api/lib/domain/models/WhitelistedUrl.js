import { CanExecute } from '../CanExecute.js';

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
    relatedEntityIds,
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
    this.relatedEntityIds = relatedEntityIds;
    this.comment = comment;
    this.checkType = checkType;
  }

  static get CHECK_TYPES() {
    return {
      EXACT_MATCH: 'exact_match',
      STARTS_WITH: 'starts_with',
    };
  }

  static canCreate(creationCommand, user, existingReadWhitelistedUrls) {
    if (!user.isAdmin) return CanExecute.cannot('L\'utilisateur n\'a pas les droits pour créer une URL whitelistée');
    if (!isUrlValid(creationCommand.url)) return CanExecute.cannot('URL invalide');
    if (!isRelatedEntityIdsValid(creationCommand.relatedEntityIds)) return CanExecute.cannot('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');
    if (!isCommentValid(creationCommand.comment)) return CanExecute.cannot('Commentaire invalide. Doit être un texte ou vide');
    if (!isCheckTypeValid(creationCommand.checkType)) return CanExecute.cannot(`Type de check invalide. Valeurs parmi : ${Object.values(WhitelistedUrl.CHECK_TYPES).join(', ')}`);
    if (!isUrlUnique(creationCommand.url, existingReadWhitelistedUrls)) return CanExecute.cannot('URL déjà whitelistée');

    return CanExecute.can();
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
      relatedEntityIds: creationCommand.relatedEntityIds,
      comment: creationCommand.comment,
      checkType: creationCommand.checkType,
    });
  }

  canDelete(user) {
    if (!user.isAdmin) return CanExecute.cannot('L\'utilisateur n\'a pas les droits pour supprimer cette URL whitelistée');
    if (this.deletedAt) return CanExecute.cannot('L\'URL whitelistée a déjà été supprimée');
    return CanExecute.can();
  }

  delete(user) {
    const operationDate = new Date();
    this.latestUpdatedBy = user.id;
    this.deletedBy = user.id;
    this.updatedAt = operationDate;
    this.deletedAt = operationDate;
  }

  canUpdate(updateCommand, user, existingReadWhitelistedUrls) {
    if (!user.isAdmin) return CanExecute.cannot('L\'utilisateur n\'a pas les droits pour mettre à jour cette URL whitelistée');
    if (this.deletedAt) return CanExecute.cannot('L\'URL whitelistée n\'existe pas');
    if (!isUrlValid(updateCommand.url)) return CanExecute.cannot('URL invalide');
    if (!isRelatedEntityIdsValid(updateCommand.relatedEntityIds)) return CanExecute.cannot('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');
    if (!isCommentValid(updateCommand.comment)) return CanExecute.cannot('Commentaire invalide. Doit être un texte ou vide');
    if (!isCheckTypeValid(updateCommand.checkType)) return CanExecute.cannot(`Type de check invalide. Valeurs parmi : ${Object.values(WhitelistedUrl.CHECK_TYPES).join(', ')}`);
    if (!isUrlUnique(updateCommand.url, existingReadWhitelistedUrls)) return CanExecute.cannot('URL déjà whitelistée');

    return CanExecute.can();
  }

  update(updateCommand, user) {
    const operationDate = new Date();
    this.latestUpdatedBy = user.id;
    this.updatedAt = operationDate;
    this.url = updateCommand.url;
    this.relatedEntityIds = updateCommand.relatedEntityIds;
    this.comment = updateCommand.comment;
    this.checkType = updateCommand.checkType;
  }
}

function isUrlValid(url) {
  try {
    new URL(url);
    // eslint-disable-next-line no-unused-vars
  } catch (_err) {
    return false;
  }
  return true;
}

function isRelatedEntityIdsValid(relatedEntityIds) {
  const idsSeparatedByCommaRegex = /^[A-Za-z0-9]+(,[A-Za-z0-9]+)*[A-Za-z0-9]+$/;
  if (!relatedEntityIds) return true;
  return idsSeparatedByCommaRegex.test(relatedEntityIds);
}

function isCommentValid(comment) {
  if (!comment) return true;
  return typeof comment === 'string';
}

function isCheckTypeValid(checkType) {
  if (typeof checkType === 'string') return Object.values(WhitelistedUrl.CHECK_TYPES).includes(checkType);
  return false;
}

function isUrlUnique(url, existingReadWhitelistedUrls) {
  return existingReadWhitelistedUrls.every((whitelistedUrl) => whitelistedUrl.url !== url);
}
