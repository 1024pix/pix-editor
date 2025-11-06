import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { User } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | User', () => {
  describe('#get isAdmin', () => {
    it('should return true when user is admin', () => {
      // given
      const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });

      // when
      const isAdmin = user.isAdmin;

      // then
      expect(isAdmin).to.be.true;
    });

    it.each(Object.keys(User.ROLES).filter((roleKey) => User.ROLES[roleKey] !== User.ROLES.ADMIN))(
      'should return false when role key is %s',
      (roleKey) => {
        // given
        const user = domainBuilder.buildUser({ access: User.ROLES[roleKey] });

        // when
        const isAdmin = user.isAdmin;

        // then
        expect(isAdmin).to.be.false;
      },
    );
  });

  describe('#get isEditor', () => {
    it('should return true when user is editor', () => {
      // given
      const user = domainBuilder.buildUser({ access: User.ROLES.EDITOR });

      // when
      const isEditor = user.isEditor;

      // then
      expect(isEditor).to.be.true;
    });

    it('should return true when user is admin', () => {
      // given
      const user = domainBuilder.buildUser({ access: User.ROLES.ADMIN });

      // when
      const isEditor = user.isEditor;

      // then
      expect(isEditor).to.be.true;
    });

    it.each(
      Object.keys(User.ROLES).filter((roleKey) => ![User.ROLES.ADMIN, User.ROLES.EDITOR].includes(User.ROLES[roleKey])),
    )('should return false when role key is %s', (roleKey) => {
      // given
      const user = domainBuilder.buildUser({ access: User.ROLES[roleKey] });

      // when
      const isEditor = user.isEditor;

      // then
      expect(isEditor).to.be.false;
    });
  });
});
