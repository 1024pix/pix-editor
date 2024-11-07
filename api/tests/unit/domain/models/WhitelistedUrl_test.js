import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { User } from '../../../../lib/domain/models/index.js';
import {
  CommandWhitelistedUrlConflictError,
  CommandWhitelistedUrlForbiddenError,
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
});
