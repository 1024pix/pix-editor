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
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'recTest12345678,recSuperTest789123',
          comment: 'COucou',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const creationCommand2 = {
          url: 'www.missing-protocol.com',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const creationCommand3 = {
          url: 123456,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'je ne suis pas une suite d ids d entités séparés par des virgules sans espaces',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };

        // when
        const canCreate = WhitelistedUrl.canCreate(creationCommand, user, []);

        // then
        expect(canCreate.cannot).to.be.true;
        expect(canCreate.errorMessage).to.equal('Commentaire invalide. Doit être un texte ou vide');
      });

      it('should return a canExecute invalid when checkType is not valid in creation command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const creationCommand1 = {
          url: 'https://www.brioche.com',
          checkType: 'autre_type',
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          checkType: null,
        };
        const creationCommand3 = {
          url: 'https://www.brioche.com',
          checkType: 456789,
        };

        // when
        const canCreate1 = WhitelistedUrl.canCreate(creationCommand1, user, []);
        const canCreate2 = WhitelistedUrl.canCreate(creationCommand2, user, []);
        const canCreate3 = WhitelistedUrl.canCreate(creationCommand3, user, []);

        // then
        const allowedValues = Object.values(WhitelistedUrl.CHECK_TYPES).join(', ');
        expect(canCreate1.cannot).to.be.true;
        expect(canCreate1.errorMessage).to.equal(`Type de check invalide. Valeurs parmi : ${allowedValues}`);
        expect(canCreate2.cannot).to.be.true;
        expect(canCreate2.errorMessage).to.equal(`Type de check invalide. Valeurs parmi : ${allowedValues}`);
        expect(canCreate3.cannot).to.be.true;
        expect(canCreate3.errorMessage).to.equal(`Type de check invalide. Valeurs parmi : ${allowedValues}`);
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'recTest12345678,recSuperTest789123',
          comment: 'COucou',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const updateCommand2 = {
          url: 'www.missing-protocol.com',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const updateCommand3 = {
          url: 123456,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          relatedEntityIds: 'je ne suis pas une suite d ids d entités séparés par des virgules sans espaces',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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

      it('should return a canExecute invalid when checkType is not valid in update command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand1 = {
          url: 'https://www.brioche.com',
          checkType: 'autre_type',
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          checkType: null,
        };
        const updateCommand3 = {
          url: 'https://www.brioche.com',
          checkType: 456789,
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
        const allowedValues = Object.values(WhitelistedUrl.CHECK_TYPES).join(', ');
        expect(canUpdate1.cannot).to.be.true;
        expect(canUpdate1.errorMessage).to.equal(`Type de check invalide. Valeurs parmi : ${allowedValues}`);
        expect(canUpdate2.cannot).to.be.true;
        expect(canUpdate2.errorMessage).to.equal(`Type de check invalide. Valeurs parmi : ${allowedValues}`);
        expect(canUpdate3.cannot).to.be.true;
        expect(canUpdate3.errorMessage).to.equal(`Type de check invalide. Valeurs parmi : ${allowedValues}`);
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      const updateCommand = {
        url: 'https://www.brioche.com',
        relatedEntityIds: 'recDautreTrucs',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
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
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      }));
    });
  });

  describe('#isMatching', function() {
    describe('exact_match', function() {
      it('should match when url is exactly the same as the whitelisted', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://mOn-Bidet_orange.com/token=COUCOU',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.true;
      });

      it('should not match when url is not the same case-wise', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://MON-Bidet_orange.com/token=COUCOU',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.false;
      });

      it('should not match when url is just partially the same', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://mOn-Bidet_orange.com/token=C',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.false;
      });

      it('should not match when url is not the same', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://quelquechose-dautre',
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.false;
      });
    });
    describe('starts_with', function() {
      it('should match when url is starts exactly with the same as the whitelisted', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://mOn-Bidet_orange.com/to',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.true;
      });
      it('should match when url is exactly the same', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://mOn-Bidet_orange.com/token=COUCOU',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.true;
      });

      it('should not match when url does not start the same case-wise', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://MON-Bidet_orange.com/to',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.false;
      });

      it('should not match when url is different even if they start similar', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://mOn-Bidet_orange.com/token=COUCOU_MAMAN',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.false;
      });

      it('should not match when url does not start the same at all', function() {
        // given
        const url = 'https://mOn-Bidet_orange.com/token=COUCOU';
        const whitelistedUrl = domainBuilder.buildWhitelistedUrl({
          url: 'https://quelquechose-dautre',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        });

        // when
        const isMatching = whitelistedUrl.isMatching(url);

        // then
        expect(isMatching).to.be.false;
      });
    });
  });
});
