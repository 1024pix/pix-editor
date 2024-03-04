import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { StaticCourse } from '../../../../lib/domain/models/index.js';
import { StaticCourseIsInactiveError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | StaticCourse', function() {
  context('static buildFromCreationCommand', function() {
    let validCreationCommand, idGenerator;
    const allChallengeIds = ['chalABC', 'chalDEF', 'chalGHI', 'chalJKF'];
    const allTagIds = [123, 456];

    beforeEach(function() {
      validCreationCommand = {
        name: 'some valid name  ',
        description: '  some valid description',
        challengeIds: ['chalGHI ', ' chalABC', 'chalJKF'],
        tagIds: [123, 456],
      };
      vi.useFakeTimers({
        now: new Date('2021-10-29T03:04:00Z'),
      });
      idGenerator = (prefix) => `${prefix}ABC123`;
    });

    afterEach(function() {
      vi.useRealTimers();
    });

    context('valid commands', function() {
      it('should create a successful CommandResult with a staticCourse with trimmed name, description and challengeIds', function() {
        // when
        const commandResult = StaticCourse.buildFromCreationCommand({
          creationCommand: validCreationCommand,
          allChallengeIds,
          allTagIds,
          idGenerator,
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'courseABC123',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
          tagIds: [123, 456],
          isActive: true,
          deactivationReason: '',
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
      });

      it('should create a valid StaticCourse without a description', function() {
        // given
        validCreationCommand.description = '';

        // when
        const commandResult = StaticCourse.buildFromCreationCommand({
          creationCommand: validCreationCommand,
          allChallengeIds,
          allTagIds,
          idGenerator,
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'courseABC123',
          name: 'some valid name',
          description: '',
          isActive: true,
          deactivationReason: '',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
          tagIds: [123, 456],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
      });
    });

    context('invalid commands', function() {
      context('when name is invalid', function() {
        it('should return a failed CommandResult', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            name: '',
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'MANDATORY_FIELD', field: 'name' },
          ]);
        });
      });

      context('when challengeIds is invalid', function() {
        it('should return a failed CommandResult when at least one challenge does not exist', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            challengeIds: ['chalABC', 'xchalLOL', 'chalGHI', 'chalDEFF'],
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'UNKNOWN_RESOURCES', field: 'challengeIds', data: ['xchalLOL', 'chalDEFF'] },
          ]);
        });

        it('should return a failed CommandResult when at least one challenge appears more than once', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            challengeIds: ['chalJKF', 'chalABC', 'chalGHI', 'chalJKF', 'chalABC'],
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'DUPLICATES_FORBIDDEN', field: 'challengeIds', data: ['chalJKF', 'chalABC'] },
          ]);
        });

        it('should return a failed CommandResult when no challenges are provided', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            challengeIds: [],
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'MANDATORY_FIELD', field: 'challengeIds' },
          ]);
        });
      });
      context('when tagIds are invalid', function() {
        it('should return a failed CommandResult when at least one tag does not exist', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            tagIds: [123, 456, 789],
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'UNKNOWN_RESOURCES', field: 'tagIds', data: [789] },
          ]);
        });

        it('should return a failed CommandResult when at least one tag appears more than once', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            tagIds: [123, 123, 456],
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'DUPLICATES_FORBIDDEN', field: 'tagIds', data: [123] },
          ]);
        });
      });
      context('when static course is invalid for several reasons', function() {
        it('should return a failed CommandResult with all reasons why it is', function() {
          // given
          const invalidCreationCommand = {
            ...validCreationCommand,
            name: '',
            challengeIds: ['chalABC', 'xchalLOL', 'chalGHI', 'chalDEFF', 'chalGHI'],
          };

          // when
          const commandResult = StaticCourse.buildFromCreationCommand({
            creationCommand: invalidCreationCommand,
            allChallengeIds,
            allTagIds,
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'MANDATORY_FIELD', field: 'name' },
            { code: 'UNKNOWN_RESOURCES', field: 'challengeIds', data: ['xchalLOL', 'chalDEFF'] },
            { code: 'DUPLICATES_FORBIDDEN', field: 'challengeIds', data: ['chalGHI'] },
          ]);
        });
      });
    });
  });

  context('update', function() {
    let validUpdateCommand, staticCourseToUpdate;
    const allChallengeIds = ['chalABC', 'chalDEF', 'chalGHI', 'chalJKF'];
    const allTagIds = [123, 456, 789, 159];

    beforeEach(function() {
      validUpdateCommand = {
        name: 'some valid name  ',
        description: '  some valid description',
        challengeIds: ['chalGHI ', ' chalABC', 'chalJKF'],
        tagIds: [123, 456],
      };
      vi.useFakeTimers({
        now: new Date('2021-10-29T03:04:00Z'),
      });
      staticCourseToUpdate = domainBuilder.buildStaticCourse({
        id: 'myAwesomeCourse66',
        name: 'old name',
        description: 'old description',
        challengeIds: ['chalDEF ', ' chalJKF'],
        tagIds: [456, 789],
        isActive: true,
        deactivationReason: 'some reason',
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-00-00T09:00:00Z'),
      });
    });

    afterEach(function() {
      vi.useRealTimers();
    });

    context('valid commands', function() {
      it('should update successfully the staticCourse with trimmed name, description and challengeIds', function() {
        // when
        const commandResult = staticCourseToUpdate.update({
          updateCommand: validUpdateCommand,
          allChallengeIds,
          allTagIds
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'myAwesomeCourse66',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
          tagIds: [123, 456],
          isActive: true,
          deactivationReason: 'some reason',
          createdAt: new Date('2021-00-00T09:00:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
      });

      it('should update successfully the staticCourse with an empty description', function() {
        // given
        validUpdateCommand.description = '';

        // when
        const commandResult = staticCourseToUpdate.update({
          updateCommand: validUpdateCommand,
          allChallengeIds,
          allTagIds,
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'myAwesomeCourse66',
          name: 'some valid name',
          description: '',
          isActive: true,
          deactivationReason: 'some reason',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
          tagIds: [123, 456],
          createdAt: new Date('2021-00-00T09:00:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
      });

      it('should return a failed CommandResult when static course is inactive', function() {
        // given
        const inactiveStaticCourse = domainBuilder.buildStaticCourse({
          id: 'myAwesomeCourse66',
          name: 'old name',
          description: 'old description',
          challengeIds: ['chalDEF ', ' chalJKF'],
          tagIds: [789, 456],
          isActive: false,
          deactivationReason: 'some reason',
          createdAt: new Date('2021-00-00T09:00:00Z'),
          updatedAt: new Date('2021-00-00T09:00:00Z'),
        });

        // when
        const commandResult = inactiveStaticCourse.update({
          updateCommand: validUpdateCommand,
          allChallengeIds,
          allTagIds,
        });

        // then
        expect(commandResult.isFailure()).to.be.true;
        expect(commandResult.value).to.be.null;
        expect(commandResult.error).to.be.instanceOf(StaticCourseIsInactiveError);
      });
    });

    context('invalid commands', function() {
      context('when name is invalid', function() {
        it('should return a failed CommandResult', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            name: '',
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'MANDATORY_FIELD', field: 'name' },
          ]);
        });
      });

      context('when challengeIds is invalid', function() {
        it('should create an invalid StaticCourse when at least one challenge does not exist', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            challengeIds: ['chalABC', 'xchalLOL', 'chalGHI', 'chalDEFF'],
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'UNKNOWN_RESOURCES', field: 'challengeIds', data: ['xchalLOL', 'chalDEFF'] },
          ]);
        });

        it('should create an invalid StaticCourse when at least one challenge appears more than once', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            challengeIds: ['chalJKF', 'chalABC', 'chalGHI', 'chalJKF', 'chalABC'],
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'DUPLICATES_FORBIDDEN', field: 'challengeIds', data: ['chalJKF', 'chalABC'] },
          ]);
        });

        it('should create an invalid StaticCourse when no challenges are provided', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            challengeIds: [],
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'MANDATORY_FIELD', field: 'challengeIds' },
          ]);
        });
      });

      context('when tagIds are invalid', function() {
        it('should create an invalid StaticCourse when at least one tag does not exist', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            tagIds: [123, 1574, 888, 456],
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'UNKNOWN_RESOURCES', field: 'tagIds', data: [1574, 888] },
          ]);
        });

        it('should create an invalid StaticCourse when at least one tag appears more than once', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            tagIds: [123, 456, 123],
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'DUPLICATES_FORBIDDEN', field: 'tagIds', data: [123] },
          ]);
        });
      });

      context('when static course is invalid for several reasons', function() {
        it('should create an invalid StaticCourse with all reasons why it is', function() {
          // given
          const invalidUpdateCommand = {
            ...validUpdateCommand,
            name: '',
            challengeIds: ['chalABC', 'xchalLOL', 'chalGHI', 'chalDEFF', 'chalGHI'],
          };

          // when
          const commandResult = staticCourseToUpdate.update({
            updateCommand: invalidUpdateCommand,
            allChallengeIds,
            allTagIds,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).toEqual([
            { code: 'MANDATORY_FIELD', field: 'name' },
            { code: 'UNKNOWN_RESOURCES', field: 'challengeIds', data: ['xchalLOL', 'chalDEFF'] },
            { code: 'DUPLICATES_FORBIDDEN', field: 'challengeIds', data: ['chalGHI'] },
          ]);
        });
      });
    });
  });

  context('deactivate', function() {
    beforeEach(function() {
      vi.useFakeTimers({
        now: new Date('2021-10-29T03:04:00Z'),
      });
    });

    afterEach(function() {
      vi.useRealTimers();
    });

    it('should make the static course inactive when it is active', function() {
      // given
      const deactivationCommand = { reason: 'On en a un mieux' };
      const activeStaticCourse = domainBuilder.buildStaticCourse({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: true,
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-00-00T09:00:00Z'),
      });

      // when
      const commandResult = activeStaticCourse.deactivate(deactivationCommand);

      // then
      expect(commandResult.isSuccess()).to.be.true;
      expect(commandResult.value.toDTO()).to.deep.equal({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: false,
        deactivationReason: 'On en a un mieux',
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-10-29T03:04:00Z'),
      });
    });

    it('should let the static course inactive when it is already inactive', function() {
      // given
      const deactivationCommand = { reason: '' };
      const inactiveStaticCourse = domainBuilder.buildStaticCourse({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: false,
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-00-00T09:00:00Z'),
      });

      // when
      const commandResult = inactiveStaticCourse.deactivate(deactivationCommand);

      // then
      expect(commandResult.isSuccess()).to.be.true;
      expect(commandResult.value.toDTO()).to.deep.equal({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: false,
        deactivationReason: '',
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-10-29T03:04:00Z'),
      });
    });
  });

  context('reactivate', function() {
    beforeEach(function() {
      vi.useFakeTimers({
        now: new Date('2021-10-29T03:04:00Z'),
      });
    });

    afterEach(function() {
      vi.useRealTimers();
    });

    it('should make the static course active when it is inactive', function() {
      // given
      const inactiveStaticCourse = domainBuilder.buildStaticCourse({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: false,
        deactivationReason: 'Parce que',
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-00-00T09:00:00Z'),
      });

      // when
      const commandResult = inactiveStaticCourse.reactivate();

      // then
      expect(commandResult.isSuccess()).to.be.true;
      expect(commandResult.value.toDTO()).to.deep.equal({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: true,
        deactivationReason: '',
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-10-29T03:04:00Z'),
      });
    });

    it('should let the static course active when it is already active', function() {
      // given
      const activeStaticCourse = domainBuilder.buildStaticCourse({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: true,
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-00-00T09:00:00Z'),
      });

      // when
      const commandResult = activeStaticCourse.reactivate();

      // then
      expect(commandResult.isSuccess()).to.be.true;
      expect(commandResult.value.toDTO()).to.deep.equal({
        id: 'myAwesomeCourse66',
        name: 'name',
        description: 'description',
        challengeIds: ['chalABC ', 'chalDEF'],
        tagIds: [123, 456],
        isActive: true,
        deactivationReason: '',
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-10-29T03:04:00Z'),
      });
    });
  });
});
