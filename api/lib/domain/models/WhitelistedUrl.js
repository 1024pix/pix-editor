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
  }

  static canCreate(creationCommand, user, existingReadWhitelistedUrls) {
    if (!user.isAdmin) return CanExecute.cannot('L\'utilisateur n\'a pas les droits pour créer une URL whitelistée');
    try {
      new URL(creationCommand.url);
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      return CanExecute.cannot('URL invalide');
    }
    const idsSeparatedByCommaRegex = /^[A-Za-z0-9]+(,[A-Za-z0-9]+)*[A-Za-z0-9]+$/;
    if (creationCommand.relatedEntityIds && !idsSeparatedByCommaRegex.test(creationCommand.relatedEntityIds))
      return CanExecute.cannot('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');

    if (creationCommand.comment && !(typeof creationCommand.comment === 'string'))
      return CanExecute.cannot('Commentaire invalide. Doit être un texte ou vide');

    if (existingReadWhitelistedUrls.some((whitelistedUrl) => whitelistedUrl.url === creationCommand.url))
      return CanExecute.cannot('URL déjà whitelistée');

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
}
