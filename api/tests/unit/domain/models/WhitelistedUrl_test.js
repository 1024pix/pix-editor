import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { User, WhitelistedUrl } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | WhitelistedUrl', () => {
  let now;
  beforeEach(function() {
    now = new Date('2024-10-29T03:04:00Z');
    vi.useFakeTimers({
      now,
      toFake: ['Date'],
    });
  });

  afterEach(function() {
    vi.useRealTimers();
  });

  describe('#canDelete', () => {
    describe('can', function() {
      it('should return a canExecute valid when all conditions are reunited', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
          deletedAt: null,
          deletedBy: null,
        });

        // when
        const canDelete = whitelistedUrlToDelete.canDelete(user);

        // then
        expect(canDelete.can).to.be.true;
      });
    });
    describe('cannot', function() {
      it('should return a canExecute invalid when user is not admin', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });
        const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
          deletedAt: null,
          deletedBy: null,
        });

        // when
        const canDelete = whitelistedUrlToDelete.canDelete(user);

        // then
        expect(canDelete.cannot).to.be.true;
        expect(canDelete.errorMessage).to.equal('L\'utilisateur n\'a pas les droits pour supprimer cette URL whitelistée');
      });

      it('should return a canExecute invalid when whitelisted url has already been deleted', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
          deletedAt: new Date('2021-01-01'),
          deletedBy: 456,
        });

        // when
        const canDelete = whitelistedUrlToDelete.canDelete(user);

        // then
        expect(canDelete.cannot).to.be.true;
        expect(canDelete.errorMessage).to.equal('L\'URL whitelistée a déjà été supprimée');
      });
    });
  });

  describe('#delete', function() {
    it('should mark as deleted the whitelisted url', function() {
      // given
      const user = domainBuilder.buildUser({ id: 888 });
      const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
        id: 123,
        createdBy: 777,
        latestUpdatedBy: 999,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      });

      // when
      whitelistedUrlToDelete.delete(user);

      // then
      expect(whitelistedUrlToDelete).toStrictEqual(domainBuilder.buildWhitelistedUrl({
        id: 123,
        createdBy: 777,
        latestUpdatedBy: 888,
        deletedBy: 888,
        createdAt: new Date('2020-01-01'),
        updatedAt: now,
        deletedAt: now,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      }));
    });
  });

  describe('#static canCreate', () => {
    describe('can', function() {
      it('should return a canExecute valid when all conditions are reunited', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.painperdu.com',
        })];
        const creationCommand1 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'recTest12345678,recSuperTest789123',
          comment: 'COucou',
        };

        // when
        const canCreate1 = WhitelistedUrl.canCreate(creationCommand1, user, existingWhitelistedUrls);
        const canCreate2 = WhitelistedUrl.canCreate(creationCommand2, user, []);

        // then
        expect(canCreate1.can).to.be.true;
        expect(canCreate2.can).to.be.true;
      });
    });
    describe('cannot', function() {
      it('should return a canExecute invalid when user is not admin', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });
        const creationCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };

        // when
        const canCreate = WhitelistedUrl.canCreate(creationCommand, user, []);

        // then
        expect(canCreate.cannot).to.be.true;
        expect(canCreate.errorMessage).to.equal('L\'utilisateur n\'a pas les droits pour créer une URL whitelistée');
      });

      it('should return a canExecute invalid when url is not valid in creation command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const creationCommand1 = {
          url: null,
        };
        const creationCommand2 = {
          url: 'www.missing-protocol.com',
        };
        const creationCommand3 = {
          url: 123456,
        };

        // when
        const canCreate1 = WhitelistedUrl.canCreate(creationCommand1, user, []);
        const canCreate2 = WhitelistedUrl.canCreate(creationCommand2, user, []);
        const canCreate3 = WhitelistedUrl.canCreate(creationCommand3, user, []);

        // then
        expect(canCreate1.cannot).to.be.true;
        expect(canCreate1.errorMessage).to.equal('URL invalide');
        expect(canCreate2.cannot).to.be.true;
        expect(canCreate2.errorMessage).to.equal('URL invalide');
        expect(canCreate3.cannot).to.be.true;
        expect(canCreate3.errorMessage).to.equal('URL invalide');
      });

      it('should return a canExecute invalid when relatedEntityIds is not in valid format in creation command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const creationCommand1 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 123456.12,
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'je ne suis pas une suite d ids d entités séparés par des virgules sans espaces',
        };

        // when
        const canCreate1 = WhitelistedUrl.canCreate(creationCommand1, user, []);
        const canCreate2 = WhitelistedUrl.canCreate(creationCommand2, user, []);

        // then
        expect(canCreate1.cannot).to.be.true;
        expect(canCreate1.errorMessage).to.equal('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');
        expect(canCreate2.cannot).to.be.true;
        expect(canCreate2.errorMessage).to.equal('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');
      });

      it('should return a canExecute invalid when comment is not in valid format in creation command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const creationCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: 123,
        };

        // when
        const canCreate = WhitelistedUrl.canCreate(creationCommand, user, []);

        // then
        expect(canCreate.cannot).to.be.true;
        expect(canCreate.errorMessage).to.equal('Commentaire invalide. Doit être un texte ou vide');
      });

      it('should return a canExecute invalid when url has already been whitelisted (case sensitive, exact match)', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.brioche.com',
        })];
        const creationCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };

        // when
        const canCreate = WhitelistedUrl.canCreate(creationCommand, user, existingWhitelistedUrls);

        // then
        expect(canCreate.cannot).to.be.true;
        expect(canCreate.errorMessage).to.equal('URL déjà whitelistée');
      });
    });
  });

  describe('#static create', () => {
    it('should return a newly created whitelisted url', function() {
      // given
      const user = domainBuilder.buildUser({ id: 444, access: User.ROLES.ADMIN });
      const creationCommand = {
        url: 'https://www.brioche.com',
        relatedEntityIds: 'recABC,redDEF',
        comment: 'coucou maman',
      };

      // when
      const createdWhitelistedUrl = WhitelistedUrl.create(creationCommand, user);

      // then
      expect(createdWhitelistedUrl).toStrictEqual(domainBuilder.buildWhitelistedUrl({
        id: null,
        createdBy: 444,
        latestUpdatedBy: 444,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        url: 'https://www.brioche.com',
        relatedEntityIds: 'recABC,redDEF',
        comment: 'coucou maman',
      }));
    });
  });

  describe('#canUpdate', () => {
    describe('can', function() {
      it('should return a canExecute valid when all conditions are reunited', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.painperdu.com',
        })];
        const updateCommand1 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'recTest12345678,recSuperTest789123',
          comment: 'COucou',
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        const canUpdate1 = whitelistedUrlToUpdate.canUpdate(updateCommand1, user, existingWhitelistedUrls);
        const canUpdate2 = whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);

        // then
        expect(canUpdate1.can).to.be.true;
        expect(canUpdate2.can).to.be.true;
      });
    });
    describe('cannot', function() {
      it('should return a canExecute invalid when user is not admin', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        const canUpdate = whitelistedUrlToUpdate.canUpdate(updateCommand, user, []);

        // then
        expect(canUpdate.cannot).to.be.true;
        expect(canUpdate.errorMessage).to.equal('L\'utilisateur n\'a pas les droits pour mettre à jour cette URL whitelistée');
      });

      it('should return a canExecute invalid when url is not valid in update command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand1 = {
          url: null,
        };
        const updateCommand2 = {
          url: 'www.missing-protocol.com',
        };
        const updateCommand3 = {
          url: 123456,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        const canUpdate1 = whitelistedUrlToUpdate.canUpdate(updateCommand1, user, []);
        const canUpdate2 = whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);
        const canUpdate3 = whitelistedUrlToUpdate.canUpdate(updateCommand3, user, []);

        // then
        expect(canUpdate1.cannot).to.be.true;
        expect(canUpdate1.errorMessage).to.equal('URL invalide');
        expect(canUpdate2.cannot).to.be.true;
        expect(canUpdate2.errorMessage).to.equal('URL invalide');
        expect(canUpdate3.cannot).to.be.true;
        expect(canUpdate3.errorMessage).to.equal('URL invalide');
      });

      it('should return a canExecute invalid when relatedEntityIds is not in valid format in update command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand1 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 123456.12,
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'je ne suis pas une suite d ids d entités séparés par des virgules sans espaces',
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        const canUpdate1 = whitelistedUrlToUpdate.canUpdate(updateCommand1, user, []);
        const canUpdate2 = whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);

        // then
        expect(canUpdate1.cannot).to.be.true;
        expect(canUpdate1.errorMessage).to.equal('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');
        expect(canUpdate2.cannot).to.be.true;
        expect(canUpdate2.errorMessage).to.equal('Liste d\'ids invalides. Doit être une suite d\'ids séparés par des virgules ou vide');
      });

      it('should return a canExecute invalid when comment is not in valid format in update command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: 123,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        const canUpdate = whitelistedUrlToUpdate.canUpdate(updateCommand, user, []);

        // then
        expect(canUpdate.cannot).to.be.true;
        expect(canUpdate.errorMessage).to.equal('Commentaire invalide. Doit être un texte ou vide');
      });

      it('should return a canExecute invalid when url has already been whitelisted (case sensitive, exact match)', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.brioche.com',
        })];
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        const canUpdate = whitelistedUrlToUpdate.canUpdate(updateCommand, user, existingWhitelistedUrls);

        // then
        expect(canUpdate.cannot).to.be.true;
        expect(canUpdate.errorMessage).to.equal('URL déjà whitelistée');
      });

      it('should return a canExecute invalid when whitelisted url is deleted', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedEntityIds: null,
          comment: null,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: 123,
          deletedAt: new Date('2020-01-01'),
        });

        // when
        const canUpdate = whitelistedUrlToUpdate.canUpdate(updateCommand, user, []);

        // then
        expect(canUpdate.cannot).to.be.true;
        expect(canUpdate.errorMessage).to.equal('L\'URL whitelistée n\'existe pas');
      });
    });
  });

  describe('#update', function() {
    it('should update the whitelisted url', function() {
      // given
      const user = domainBuilder.buildUser({ id: 888 });
      const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
        id: 123,
        createdBy: 777,
        latestUpdatedBy: 999,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2022-02-02'),
        deletedAt: null,
        url: 'https://www.google.com',
        relatedEntityIds: 'recINswt85utqO5KJ,recPiCGFhfgervqr5',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      });
      const updateCommand = {
        url: 'https://www.brioche.com',
        relatedEntityIds: 'recDautreTrucs',
        comment: null,
      };

      // when
      whitelistedUrlToUpdate.update(updateCommand, user);

      // then
      expect(whitelistedUrlToUpdate).toStrictEqual(domainBuilder.buildWhitelistedUrl({
        id: 123,
        createdBy: 777,
        latestUpdatedBy: 888,
        deletedBy: null,
        createdAt: new Date('2020-01-01'),
        updatedAt: now,
        deletedAt: null,
        url: 'https://www.brioche.com',
        relatedEntityIds: 'recDautreTrucs',
        comment: null,
      }));
    });
  });
});
