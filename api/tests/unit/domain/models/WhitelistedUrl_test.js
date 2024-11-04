import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { User, WhitelistedUrl } from '../../../../lib/domain/models/index.js';
import {
  CommandWhitelistedUrlConflictError,
  CommandWhitelistedUrlError,
  CommandWhitelistedUrlForbiddenError,
  NotFoundWhitelistedUrlError
} from '../../../../lib/domain/errors.js';

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
      it('should not throw when all conditions are reunited', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
          deletedAt: null,
          deletedBy: null,
        });

        // when
        whitelistedUrlToDelete.canDelete(user);

        // then
        expect(true).to.be.true;
      });
    });
    describe('cannot', function() {
      it('should throw a CommandWhitelistedUrlForbiddenError when user is not admin', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });
        const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
          deletedAt: null,
          deletedBy: null,
        });

        // when
        try {
          whitelistedUrlToDelete.canDelete(user);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlForbiddenError(
            'L\'utilisateur n\'a pas les droits pour supprimer cette URL whitelistée'
          ));
        }
      });

      it('should throw a CommandWhitelistedUrlConflictError when whitelisted url has already been deleted', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const whitelistedUrlToDelete = domainBuilder.buildWhitelistedUrl({
          deletedAt: new Date('2021-01-01'),
          deletedBy: 456,
        });

        // when
        try {
          whitelistedUrlToDelete.canDelete(user);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlConflictError(
            'L\'URL whitelistée a déjà été supprimée'
          ));
        }
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
        relatedSkillNames: '@noix2,@chose8',
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
        relatedSkillNames: '@noix2,@chose8',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
      }));
    });
  });

  describe('#static canCreate', () => {
    describe('can', function() {
      it('should not throw when all conditions are reunited', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.painperdu.com',
        })];
        const creationCommand1 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: '@choix1,@creux7',
          comment: 'COucou',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };

        // when
        WhitelistedUrl.canCreate(creationCommand1, user, existingWhitelistedUrls);
        WhitelistedUrl.canCreate(creationCommand2, user, []);

        // then
        expect(true).to.be.true;
      });
    });
    describe('cannot', function() {
      it('should throw a CommandWhitelistedUrlForbiddenError when user is not admin', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });
        const creationCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };

        // when
        try {
          WhitelistedUrl.canCreate(creationCommand, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlForbiddenError(
            'L\'utilisateur n\'a pas les droits pour créer une URL whitelistée'
          ));
        }
      });

      it('should throw a CommandWhitelistedUrlError when url is not valid in creation command', function() {
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
        try {
          WhitelistedUrl.canCreate(creationCommand1, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'URL invalide',
            attribute: 'url',
          }));
        }
        try {
          WhitelistedUrl.canCreate(creationCommand2, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'URL invalide',
            attribute: 'url',
          }));
        }
        try {
          WhitelistedUrl.canCreate(creationCommand3, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'URL invalide',
            attribute: 'url',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlError when relatedSkillNames is not in valid format in creation command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const creationCommand1 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: 123456.12,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const creationCommand2 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: 'je ne suis pas une suite d acquis',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };

        // when
        try {
          WhitelistedUrl.canCreate(creationCommand1, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'Liste d\'acquis invalide. Doit être une suite d\'acquis séparés par des virgules ou vide',
            attribute: 'relatedSkillNames',
          }));
        }
        try {
          WhitelistedUrl.canCreate(creationCommand2, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'Liste d\'acquis invalide. Doit être une suite d\'acquis séparés par des virgules ou vide',
            attribute: 'relatedSkillNames',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlError when comment is not in valid format in creation command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const creationCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: 123,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };

        // when
        try {
          WhitelistedUrl.canCreate(creationCommand, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'Commentaire invalide. Doit être un texte ou vide',
            attribute: 'comment',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlError when checkType is not valid in creation command', function() {
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
        const allowedValues = Object.values(WhitelistedUrl.CHECK_TYPES).join(', ');
        try {
          WhitelistedUrl.canCreate(creationCommand1, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: `Type de check invalide. Valeurs parmi : ${allowedValues}`,
            attribute: 'checkType',
          }));
        }
        try {
          WhitelistedUrl.canCreate(creationCommand2, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: `Type de check invalide. Valeurs parmi : ${allowedValues}`,
            attribute: 'checkType',
          }));
        }
        try {
          WhitelistedUrl.canCreate(creationCommand3, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: `Type de check invalide. Valeurs parmi : ${allowedValues}`,
            attribute: 'checkType',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlConflictError when url has already been whitelisted (case sensitive, exact match)', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.brioche.com',
        })];
        const creationCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };

        // when
        try {
          WhitelistedUrl.canCreate(creationCommand, user, existingWhitelistedUrls);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlConflictError(
            'URL déjà whitelistée'
          ));
        }
      });
    });
  });

  describe('#static create', () => {
    it('should return a newly created whitelisted url', function() {
      // given
      const user = domainBuilder.buildUser({ id: 444, access: User.ROLES.ADMIN });
      const creationCommand = {
        url: 'https://www.brioche.com',
        relatedSkillNames: '@proie2,@cancre5',
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
        relatedSkillNames: '@proie2,@cancre5',
        comment: 'coucou maman',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      }));
    });
  });

  describe('#canUpdate', () => {
    describe('can', function() {
      it('should not throw when all conditions are reunited', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.painperdu.com',
        })];
        const updateCommand1 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: '@choix1,@creux7',
          comment: 'COucou',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        whitelistedUrlToUpdate.canUpdate(updateCommand1, user, existingWhitelistedUrls);
        whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);

        // then
        expect(true).to.be.true;
      });
    });
    describe('cannot', function() {
      it('should throw a CommandWhitelistedUrlForbiddenError when user is not admin', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlForbiddenError(
            'L\'utilisateur n\'a pas les droits pour mettre à jour cette URL whitelistée'
          ));
        }
      });

      it('should throw a CommandWhitelistedUrlError when url is not valid in update command', function() {
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
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand1, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'URL invalide',
            attribute: 'url',
          }));
        }
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'URL invalide',
            attribute: 'url',
          }));
        }
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand3, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'URL invalide',
            attribute: 'url',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlError when relatedSkillNames is not in valid format in update command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand1 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: 123456.12,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const updateCommand2 = {
          url: 'https://www.brioche.com',
          relatedSkillNames: 'je ne suis pas une suite d acquis',
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand1, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'Liste d\'acquis invalide. Doit être une suite d\'acquis séparés par des virgules ou vide',
            attribute: 'relatedSkillNames',
          }));
        }
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'Liste d\'acquis invalide. Doit être une suite d\'acquis séparés par des virgules ou vide',
            attribute: 'relatedSkillNames',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlError when comment is not in valid format in update command', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: 123,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: 'Commentaire invalide. Doit être un texte ou vide',
            attribute: 'comment',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlError when checkType is not valid in update command', function() {
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
        const allowedValues = Object.values(WhitelistedUrl.CHECK_TYPES).join(', ');
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand1, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: `Type de check invalide. Valeurs parmi : ${allowedValues}`,
            attribute: 'checkType',
          }));
        }
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand2, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: `Type de check invalide. Valeurs parmi : ${allowedValues}`,
            attribute: 'checkType',
          }));
        }
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand3, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlError({
            message: `Type de check invalide. Valeurs parmi : ${allowedValues}`,
            attribute: 'checkType',
          }));
        }
      });

      it('should throw a CommandWhitelistedUrlConflictError when url has already been whitelisted (case sensitive, exact match)', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const existingWhitelistedUrls = [domainBuilder.buildReadWhitelistedUrl({
          url: 'https://www.brioche.com',
        })];
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: null,
          deletedAt: null,
        });

        // when
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand, user, existingWhitelistedUrls);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new CommandWhitelistedUrlConflictError(
            'URL déjà whitelistée'
          ));
        }
      });

      it('should throw a NotFoundWhitelistedUrlError when whitelisted url is deleted', function() {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });
        const updateCommand = {
          url: 'https://www.brioche.com',
          relatedSkillNames: null,
          comment: null,
          checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        };
        const whitelistedUrlToUpdate = domainBuilder.buildWhitelistedUrl({
          deletedBy: 123,
          deletedAt: new Date('2020-01-01'),
        });

        // when
        try {
          whitelistedUrlToUpdate.canUpdate(updateCommand, user, []);
          expect(false, 'Should have thrown').to.be.true;
        } catch (err) {
          expect(err).toStrictEqual(new NotFoundWhitelistedUrlError(
            'L\'URL whitelistée n\'existe pas'
          ));
        }
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
        relatedSkillNames: '@noix2,@chose8',
        comment: 'Je décide de whitelister ça car mon cousin travaille chez google',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
      });
      const updateCommand = {
        url: 'https://www.brioche.com',
        relatedSkillNames: '@bidule4',
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
        relatedSkillNames: '@bidule4',
        comment: null,
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
      }));
    });
  });
});
