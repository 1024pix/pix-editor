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
