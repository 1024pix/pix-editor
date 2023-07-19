const { expect, sinon, domainBuilder } = require('../../../test-helper');
const StaticCourse = require('../../../../lib/domain/models/StaticCourse');

describe('Unit | Domain | StaticCourse', function() {
  context('static buildFromCreationCommand', function() {
    let clock, validCreationCommand, idGenerator;
    const allChallengeIds = ['chalABC', 'chalDEF', 'chalGHI', 'chalJKF'];

    beforeEach(function() {
      validCreationCommand = {
        name: 'some valid name  ',
        description: '  some valid description',
        challengeIds: ['chalGHI ', ' chalABC', 'chalJKF'],
      };
      clock = sinon.useFakeTimers(new Date('2021-10-29T03:04:00Z'));
      idGenerator = (prefix) => `${prefix}ABC123`;
    });

    afterEach(function() {
      clock.restore();
    });

    context('valid commands', function() {
      it('should create a successful CommandResult with a staticCourse with trimmed name, description and challengeIds', function() {
        // when
        const commandResult = StaticCourse.buildFromCreationCommand({
          creationCommand: validCreationCommand,
          allChallengeIds,
          idGenerator,
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'courseABC123',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
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
          idGenerator,
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'courseABC123',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
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
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).to.deepEqualArray([
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
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).to.deepEqualArray([
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
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).to.deepEqualArray([
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
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).to.deepEqualArray([
            { code: 'MANDATORY_FIELD', field: 'challengeIds' },
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
            idGenerator,
          });

          // then
          expect(commandResult.isFailure()).to.be.true;
          expect(commandResult.value).to.be.null;
          expect(commandResult.error.errors).to.deepEqualArray([
            { code: 'MANDATORY_FIELD', field: 'name' },
            { code: 'UNKNOWN_RESOURCES', field: 'challengeIds', data: ['xchalLOL', 'chalDEFF'] },
            { code: 'DUPLICATES_FORBIDDEN', field: 'challengeIds', data: ['chalGHI'] },
          ]);
        });
      });
    });
  });

  context('update', function() {
    let clock, validUpdateCommand, staticCourseToUpdate;
    const allChallengeIds = ['chalABC', 'chalDEF', 'chalGHI', 'chalJKF'];

    beforeEach(function() {
      validUpdateCommand = {
        name: 'some valid name  ',
        description: '  some valid description',
        challengeIds: ['chalGHI ', ' chalABC', 'chalJKF'],
      };
      clock = sinon.useFakeTimers(new Date('2021-10-29T03:04:00Z'));
      staticCourseToUpdate = domainBuilder.buildStaticCourse({
        id: 'myAwesomeCourse66',
        name: 'old name',
        description: 'old description',
        challengeIds: ['chalDEF ', ' chalJKF'],
        createdAt: new Date('2021-00-00T09:00:00Z'),
        updatedAt: new Date('2021-00-00T09:00:00Z'),
      });
    });

    afterEach(function() {
      clock.restore();
    });

    context('valid commands', function() {
      it('should update successfully the staticCourse with trimmed name, description and challengeIds', function() {
        // when
        const commandResult = staticCourseToUpdate.update({
          updateCommand: validUpdateCommand,
          allChallengeIds,
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'myAwesomeCourse66',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
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
        });

        // then
        expect(commandResult.isSuccess()).to.be.true;
        expect(commandResult.value.toDTO()).to.deep.equal({
          id: 'myAwesomeCourse66',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalGHI', 'chalABC', 'chalJKF'],
          createdAt: new Date('2021-00-00T09:00:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
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
            });

            // then
            expect(commandResult.isFailure()).to.be.true;
            expect(commandResult.value).to.be.null;
            expect(commandResult.error.errors).to.deepEqualArray([
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
            });

            // then
            expect(commandResult.isFailure()).to.be.true;
            expect(commandResult.value).to.be.null;
            expect(commandResult.error.errors).to.deepEqualArray([
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
            });

            // then
            expect(commandResult.isFailure()).to.be.true;
            expect(commandResult.value).to.be.null;
            expect(commandResult.error.errors).to.deepEqualArray([
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
            });

            // then
            expect(commandResult.isFailure()).to.be.true;
            expect(commandResult.value).to.be.null;
            expect(commandResult.error.errors).to.deepEqualArray([
              { code: 'MANDATORY_FIELD', field: 'challengeIds' },
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
            });

            // then
            expect(commandResult.isFailure()).to.be.true;
            expect(commandResult.value).to.be.null;
            expect(commandResult.error.errors).to.deepEqualArray([
              { code: 'MANDATORY_FIELD', field: 'name' },
              { code: 'UNKNOWN_RESOURCES', field: 'challengeIds', data: ['xchalLOL', 'chalDEFF'] },
              { code: 'DUPLICATES_FORBIDDEN', field: 'challengeIds', data: ['chalGHI'] },
            ]);
          });
        });
      });
    });
  });
});
