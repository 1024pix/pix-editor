const { expect, sinon } = require('../../../test-helper');
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
        it('should create an invalid StaticCourse', function() {
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
          expect(commandResult.failureReasons).to.deepEqualArray([
            'Invalid or empty "name"',
          ]);
        });
      });

      context('when challengeIds is invalid', function() {
        it('should create an invalid StaticCourse when at least one challenge does not exist', function() {
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
          expect(commandResult.failureReasons).to.deepEqualArray([
            'Following challenges do not exist : "xchalLOL", "chalDEFF"',
          ]);
        });

        it('should create an invalid StaticCourse when at least one challenge appears more than once', function() {
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
          expect(commandResult.failureReasons).to.deepEqualArray([
            'Following challenges appear more than once : "chalJKF", "chalABC"',
          ]);
        });

        it('should create an invalid StaticCourse when no challenges are provided', function() {
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
          expect(commandResult.failureReasons).to.deepEqualArray([
            'No challenges provided',
          ]);
        });
      });

      context('when static course is invalid for several reasons', function() {
        it('should create an invalid StaticCourse with all reasons why it is', function() {
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
          expect(commandResult.failureReasons).to.have.members([
            'Following challenges do not exist : "xchalLOL", "chalDEFF"',
            'Invalid or empty "name"',
            'Following challenges appear more than once : "chalGHI"',
          ]);
        });
      });
    });
  });
});
