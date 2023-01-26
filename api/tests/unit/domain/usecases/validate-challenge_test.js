const { expect, domainBuilder, catchErr, sinon } = require('../../../test-helper');
const { validateChallenge } = require('../../../../lib/domain/usecases');

describe('Unit | Usecase | validate-challenge', function() {
  let tubeForEditorRepositoryStub;

  beforeEach(function() {
    tubeForEditorRepositoryStub = {
      getByChallengeId: sinon.stub(),
      save: sinon.stub(),
    };
  });

  context('error cases', function() {
    const errorChallengeId = 'challengeToValidateId';
    context('when the corresponding tube does not exist', function() {
      it('should throw an Error', async function() {
        // given
        tubeForEditorRepositoryStub.getByChallengeId.resolves(null);
        tubeForEditorRepositoryStub.save.rejects(new Error('"tubeForEditorRepositoryStub.save" should not be called'));

        // when
        const validateChallengeCommand = { challengeId: errorChallengeId, alternativeIdsToValidate: [], changelog: '' };
        const error = await catchErr(validateChallenge)({
          validateChallengeCommand,
          tubeForEditorRepository: tubeForEditorRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Cannot validate challenge "challengeToValidateId": corresponding tube not found.');
      });
    });

    context('when the challenge is in workbench', function() {
      it('should throw an Error', async function() {
        // given
        const challenge = domainBuilder.buildChallengeForEditor.draftPrototype({ id: errorChallengeId });
        const challengeCollection = domainBuilder.buildChallengeCollectionForEditor({ challenges: [challenge] });
        const skill = domainBuilder.buildSkillForEditor.workbench({ challengeCollections: [challengeCollection] });
        const tube = domainBuilder.buildTubeForEditor({ skills: [skill] });
        tubeForEditorRepositoryStub.getByChallengeId.withArgs(errorChallengeId).resolves(tube);
        tubeForEditorRepositoryStub.save.rejects(new Error('"tubeForEditorRepositoryStub.save" should not be called'));

        // when
        const validateChallengeCommand = { challengeId: errorChallengeId, alternativeIdsToValidate: [], changelog: '' };
        const error = await catchErr(validateChallenge)({
          validateChallengeCommand,
          tubeForEditorRepository: tubeForEditorRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Cannot validate challenge "challengeToValidateId": challenge still in workbench.');
      });
    });

    context('prototype', function() {
      context('when the challenge is already validated', function() {
        it('should throw an Error', async function() {
          // given
          const challenge = domainBuilder.buildChallengeForEditor.validatedPrototype({ id: errorChallengeId });
          const challengeCollection = domainBuilder.buildChallengeCollectionForEditor({ challenges: [challenge] });
          const skill = domainBuilder.buildSkillForEditor.active({ challengeCollections: [challengeCollection] });
          const tube = domainBuilder.buildTubeForEditor({ skills: [skill] });
          tubeForEditorRepositoryStub.getByChallengeId.withArgs(errorChallengeId).resolves(tube);
          tubeForEditorRepositoryStub.save.rejects(new Error('"tubeForEditorRepositoryStub.save" should not be called'));

          // when
          const validateChallengeCommand = { challengeId: errorChallengeId, alternativeIdsToValidate: [], changelog: '' };
          const error = await catchErr(validateChallenge)({
            validateChallengeCommand,
            tubeForEditorRepository: tubeForEditorRepositoryStub,
          });

          // then
          expect(error).to.be.instanceOf(Error);
          expect(error.message).to.equal('Cannot validate challenge "challengeToValidateId": challenge already validated.');
        });
      });
    });

    context('alternative', function() {
      context('when the corresponding prototype is not validated', function() {
        it('should throw an Error', async function() {
          // given
          const challenge = domainBuilder.buildChallengeForEditor.draftAlternative({ id: errorChallengeId });
          const prototype = domainBuilder.buildChallengeForEditor.draftPrototype({ id: 'challengeProtoId' });
          const challengeCollection = domainBuilder.buildChallengeCollectionForEditor({ challenges: [challenge, prototype] });
          const skill = domainBuilder.buildSkillForEditor.active({ challengeCollections: [challengeCollection] });
          const tube = domainBuilder.buildTubeForEditor({ skills: [skill] });
          tubeForEditorRepositoryStub.getByChallengeId.withArgs(errorChallengeId).resolves(tube);
          tubeForEditorRepositoryStub.save.rejects(new Error('"tubeForEditorRepositoryStub.save" should not be called'));

          // when
          const validateChallengeCommand = { challengeId: errorChallengeId, alternativeIdsToValidate: [], changelog: '' };
          const error = await catchErr(validateChallenge)({
            validateChallengeCommand,
            tubeForEditorRepository: tubeForEditorRepositoryStub,
          });

          // then
          expect(error).to.be.instanceOf(Error);
          expect(error.message).to.equal('Cannot validate challenge "challengeToValidateId": challenge\'s prototype not validated.');
        });
      });
      context('when the challenge is already validated', function() {
        it('should throw an Error', async function() {
          // given
          const challenge = domainBuilder.buildChallengeForEditor.validatedAlternative({ id: errorChallengeId });
          const prototype = domainBuilder.buildChallengeForEditor.validatedPrototype({ id: 'challengeProtoId' });
          const challengeCollection = domainBuilder.buildChallengeCollectionForEditor({ challenges: [challenge, prototype] });
          const skill = domainBuilder.buildSkillForEditor.active({ challengeCollections: [challengeCollection] });
          const tube = domainBuilder.buildTubeForEditor({ skills: [skill] });
          tubeForEditorRepositoryStub.getByChallengeId.withArgs(errorChallengeId).resolves(tube);
          tubeForEditorRepositoryStub.save.rejects(new Error('"tubeForEditorRepositoryStub.save" should not be called'));

          // when
          const validateChallengeCommand = { challengeId: errorChallengeId, alternativeIdsToValidate: [], changelog: '' };
          const error = await catchErr(validateChallenge)({
            validateChallengeCommand,
            tubeForEditorRepository: tubeForEditorRepositoryStub,
          });

          // then
          expect(error).to.be.instanceOf(Error);
          expect(error.message).to.equal('Cannot validate challenge "challengeToValidateId": challenge already validated.');
        });
      });
    });
  });

  context('success cases', function() {
    let activeSkill_archivedCollection_archivedProto;
    let activeSkill_archivedCollection_archivedAlternative;
    let activeSkill_archivedCollection_draftAlternative;
    let activeSkill_archivedCollection_outdatedAlternative;
    let activeSkill_draftCollection_draftProto;
    let activeSkill_draftCollection_draftAlternative1;
    let activeSkill_draftCollection_draftAlternative2;
    let activeSkill_draftCollection_outdatedAlternative;
    let activeSkill_validatedCollection_validatedProto;
    let activeSkill_validatedCollection_validatedAlternative;
    let activeSkill_validatedCollection_archivedAlternative;
    let activeSkill_validatedCollection_draftAlternative;
    let activeSkill_validatedCollection_outdatedAlternative;
    let draftSkill_archivedCollection_archivedProto;
    let draftSkill_archivedCollection_archivedAlternative;
    let draftSkill_archivedCollection_draftAlternative;
    let draftSkill_archivedCollection_outdatedAlternative;
    let draftSkill_draftCollection_draftProto;
    let draftSkill_draftCollection_draftAlternative1;
    let draftSkill_draftCollection_draftAlternative2;
    let draftSkill_draftCollection_outdatedAlternative;
    let otherLevelActiveSkill_validatedCollection_validatedProto;
    let otherLevelActiveSkill_validatedCollection_validatedAlternative;
    let activeSkill, draftSkill, otherLevelActiveSkill;
    let tube;

    beforeEach(function() {
      // active skill level 3
      activeSkill_archivedCollection_archivedProto = domainBuilder.buildChallengeForEditor.archivedPrototype({ id: 'activeSkill_archivedCollection_archivedProto' });
      activeSkill_archivedCollection_archivedAlternative = domainBuilder.buildChallengeForEditor.archivedAlternative({ id: 'activeSkill_archivedCollection_archivedAlternative' });
      activeSkill_archivedCollection_draftAlternative = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'activeSkill_archivedCollection_draftAlternative' });
      activeSkill_archivedCollection_outdatedAlternative = domainBuilder.buildChallengeForEditor.outdatedAlternative({ id: 'activeSkill_archivedCollection_outdatedAlternative' });
      activeSkill_draftCollection_draftProto = domainBuilder.buildChallengeForEditor.draftPrototype({ id: 'activeSkill_draftCollection_draftProto' });
      activeSkill_draftCollection_draftAlternative1 = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'activeSkill_draftCollection_draftAlternative1' });
      activeSkill_draftCollection_draftAlternative2 = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'activeSkill_draftCollection_draftAlternative2' });
      activeSkill_draftCollection_outdatedAlternative = domainBuilder.buildChallengeForEditor.outdatedAlternative({ id: 'activeSkill_draftCollection_outdatedAlternative' });
      activeSkill_validatedCollection_validatedProto = domainBuilder.buildChallengeForEditor.validatedPrototype({ id: 'activeSkill_validatedCollection_validatedProto' });
      activeSkill_validatedCollection_validatedAlternative = domainBuilder.buildChallengeForEditor.validatedAlternative({ id: 'activeSkill_validatedCollection_validatedAlternative' });
      activeSkill_validatedCollection_archivedAlternative = domainBuilder.buildChallengeForEditor.archivedAlternative({ id: 'activeSkill_validatedCollection_archivedAlternative' });
      activeSkill_validatedCollection_draftAlternative = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'activeSkill_validatedCollection_draftAlternative' });
      activeSkill_validatedCollection_outdatedAlternative = domainBuilder.buildChallengeForEditor.outdatedAlternative({ id: 'activeSkill_validatedCollection_outdatedAlternative' });
      const activeSkill_archivedCollection = domainBuilder.buildChallengeCollectionForEditor({
        version: 1,
        challenges: [
          activeSkill_archivedCollection_archivedProto,
          activeSkill_archivedCollection_archivedAlternative,
          activeSkill_archivedCollection_draftAlternative,
          activeSkill_archivedCollection_outdatedAlternative,
        ],
      });
      const activeSkill_draftCollection = domainBuilder.buildChallengeCollectionForEditor({
        version: 2,
        challenges: [
          activeSkill_draftCollection_draftProto,
          activeSkill_draftCollection_draftAlternative1,
          activeSkill_draftCollection_draftAlternative2,
          activeSkill_draftCollection_outdatedAlternative,
        ],
      });
      const activeSkill_validatedCollection = domainBuilder.buildChallengeCollectionForEditor({
        version: 3,
        challenges: [
          activeSkill_validatedCollection_validatedProto,
          activeSkill_validatedCollection_validatedAlternative,
          activeSkill_validatedCollection_archivedAlternative,
          activeSkill_validatedCollection_draftAlternative,
          activeSkill_validatedCollection_outdatedAlternative,
        ],
      });
      activeSkill = domainBuilder.buildSkillForEditor.active({
        id: 'activeSkill',
        name: '@mangerDesFruits3',
        level: 3,
        challengeCollections: [
          activeSkill_archivedCollection,
          activeSkill_draftCollection,
          activeSkill_validatedCollection,
        ],
      });

      // draft skill level 3
      draftSkill_archivedCollection_archivedProto = domainBuilder.buildChallengeForEditor.archivedPrototype({ id: 'draftSkill_archivedCollection_archivedProto' });
      draftSkill_archivedCollection_archivedAlternative = domainBuilder.buildChallengeForEditor.archivedAlternative({ id: 'draftSkill_archivedCollection_archivedAlternative' });
      draftSkill_archivedCollection_draftAlternative = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'draftSkill_archivedCollection_draftAlternative' });
      draftSkill_archivedCollection_outdatedAlternative = domainBuilder.buildChallengeForEditor.outdatedAlternative({ id: 'draftSkill_archivedCollection_outdatedAlternative' });
      draftSkill_draftCollection_draftProto = domainBuilder.buildChallengeForEditor.draftPrototype({ id: 'draftSkill_draftCollection_draftProto' });
      draftSkill_draftCollection_draftAlternative1 = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'draftSkill_draftCollection_draftAlternative1' });
      draftSkill_draftCollection_draftAlternative2 = domainBuilder.buildChallengeForEditor.draftAlternative({ id: 'draftSkill_draftCollection_draftAlternative2' });
      draftSkill_draftCollection_outdatedAlternative = domainBuilder.buildChallengeForEditor.outdatedAlternative({ id: 'draftSkill_draftCollection_outdatedAlternative' });
      const draftSkill_archivedCollection = domainBuilder.buildChallengeCollectionForEditor({
        version: 1,
        challenges: [
          draftSkill_archivedCollection_archivedProto,
          draftSkill_archivedCollection_archivedAlternative,
          draftSkill_archivedCollection_draftAlternative,
          draftSkill_archivedCollection_outdatedAlternative,
        ],
      });
      const draftSkill_draftCollection = domainBuilder.buildChallengeCollectionForEditor({
        version: 2,
        challenges: [
          draftSkill_draftCollection_draftProto,
          draftSkill_draftCollection_draftAlternative1,
          draftSkill_draftCollection_draftAlternative2,
          draftSkill_draftCollection_outdatedAlternative,
        ],
      });
      draftSkill = domainBuilder.buildSkillForEditor.draft({
        id: 'draftSkill',
        name: '@mangerDesFruits3',
        level: 3,
        challengeCollections: [
          draftSkill_archivedCollection,
          draftSkill_draftCollection,
        ],
      });

      // skill level 2
      otherLevelActiveSkill_validatedCollection_validatedProto = domainBuilder.buildChallengeForEditor.validatedPrototype({ id: 'otherLevelActiveSkill_validatedCollection_validatedProto' });
      otherLevelActiveSkill_validatedCollection_validatedAlternative = domainBuilder.buildChallengeForEditor.validatedAlternative({ id: 'otherLevelActiveSkill_validatedCollection_validatedAlternative' });
      const otherLevelActiveSkill_validatedCollection = domainBuilder.buildChallengeCollectionForEditor({
        version: 1,
        challenges: [
          otherLevelActiveSkill_validatedCollection_validatedProto,
          otherLevelActiveSkill_validatedCollection_validatedAlternative,
        ],
      });
      otherLevelActiveSkill = domainBuilder.buildSkillForEditor.active({
        id: 'otherLevelActiveSkill',
        name: '@mangerDesFruits2',
        level: 2,
        challengeCollections: [ otherLevelActiveSkill_validatedCollection ],
      });

      tube = domainBuilder.buildTubeForEditor({ skills: [activeSkill, draftSkill, otherLevelActiveSkill ] });
    });

    it('should save the tube', async function() {
      // given
      const challengeToValidateId = 'activeSkill_validatedCollection_draftAlternative';
      tubeForEditorRepositoryStub.getByChallengeId.withArgs(challengeToValidateId).resolves(tube);
      tubeForEditorRepositoryStub.save.resolves();

      // when
      const validateChallengeCommand = { challengeId: challengeToValidateId, alternativeIdsToValidate: [], changelog: '' };
      await validateChallenge({
        validateChallengeCommand,
        tubeForEditorRepository: tubeForEditorRepositoryStub,
      });

      // then
      expect(tubeForEditorRepositoryStub.save).to.have.been.calledWithExactly(tube);
    });

    context('alternative', function() {
      it('should only validate the challenge', async function() {
        // given
        const challengeToValidateId = 'activeSkill_validatedCollection_draftAlternative';
        tubeForEditorRepositoryStub.getByChallengeId.withArgs(challengeToValidateId).resolves(tube);
        tubeForEditorRepositoryStub.save.withArgs(tube).resolves();

        // when
        const validateChallengeCommand = { challengeId: challengeToValidateId, alternativeIdsToValidate: [], changelog: '' };
        await validateChallenge({
          validateChallengeCommand,
          tubeForEditorRepository: tubeForEditorRepositoryStub,
        });

        // then
        // changes
        expect(activeSkill_validatedCollection_draftAlternative.isValidated).to.be.true;
        // remains the same
        expect(activeSkill_archivedCollection_archivedProto.isArchived).to.be.true;
        expect(activeSkill_archivedCollection_archivedAlternative.isArchived).to.be.true;
        expect(activeSkill_archivedCollection_draftAlternative.isDraft).to.be.true;
        expect(activeSkill_archivedCollection_outdatedAlternative.isOutdated).to.be.true;
        expect(activeSkill_draftCollection_draftProto.isDraft).to.be.true;
        expect(activeSkill_draftCollection_draftAlternative1.isDraft).to.be.true;
        expect(activeSkill_draftCollection_draftAlternative2.isDraft).to.be.true;
        expect(activeSkill_draftCollection_outdatedAlternative.isOutdated).to.be.true;
        expect(activeSkill_validatedCollection_validatedProto.isValidated).to.be.true;
        expect(activeSkill_validatedCollection_validatedAlternative.isValidated).to.be.true;
        expect(activeSkill_validatedCollection_archivedAlternative.isArchived).to.be.true;
        expect(activeSkill_validatedCollection_outdatedAlternative.isOutdated).to.be.true;
        expect(draftSkill_archivedCollection_archivedProto.isArchived).to.be.true;
        expect(draftSkill_archivedCollection_archivedAlternative.isArchived).to.be.true;
        expect(draftSkill_archivedCollection_draftAlternative.isDraft).to.be.true;
        expect(draftSkill_archivedCollection_outdatedAlternative.isOutdated).to.be.true;
        expect(draftSkill_draftCollection_draftProto.isDraft).to.be.true;
        expect(draftSkill_draftCollection_draftAlternative1.isDraft).to.be.true;
        expect(draftSkill_draftCollection_draftAlternative2.isDraft).to.be.true;
        expect(draftSkill_draftCollection_outdatedAlternative.isOutdated).to.be.true;
        expect(otherLevelActiveSkill_validatedCollection_validatedProto.isValidated).to.be.true;
        expect(otherLevelActiveSkill_validatedCollection_validatedAlternative.isValidated).to.be.true;
        expect(activeSkill.isActive).to.be.true;
        expect(draftSkill.isDraft).to.be.true;
        expect(otherLevelActiveSkill.isActive).to.be.true;
      });
    });

    context('prototype', function() {
      context('when the prototype belongs to the same skill as the one currently active', function() {
        it('should validate prototype and draft alternatives given as parameter, and archive proto and alternatives that used to be the validate ones', async function() {
          // given
          const challengeToValidateId = 'activeSkill_draftCollection_draftProto';
          const draftAlternativeToValidateId = 'activeSkill_draftCollection_draftAlternative2';
          tubeForEditorRepositoryStub.getByChallengeId.withArgs(challengeToValidateId).resolves(tube);
          tubeForEditorRepositoryStub.save.withArgs(tube).resolves();

          // when
          const validateChallengeCommand = { challengeId: challengeToValidateId, alternativeIdsToValidate: [draftAlternativeToValidateId], changelog: '' };
          await validateChallenge({
            validateChallengeCommand,
            tubeForEditorRepository: tubeForEditorRepositoryStub,
          });

          // then
          // changes
          expect(activeSkill_draftCollection_draftProto.isValidated).to.be.true;
          expect(activeSkill_draftCollection_draftAlternative2.isValidated).to.be.true;
          expect(activeSkill_validatedCollection_validatedProto.isArchived).to.be.true;
          expect(activeSkill_validatedCollection_validatedAlternative.isArchived).to.be.true;
          expect(activeSkill_validatedCollection_draftAlternative.isOutdated).to.be.true;
          // remains the same
          expect(activeSkill_archivedCollection_archivedProto.isArchived).to.be.true;
          expect(activeSkill_archivedCollection_archivedAlternative.isArchived).to.be.true;
          expect(activeSkill_archivedCollection_draftAlternative.isDraft).to.be.true;
          expect(activeSkill_archivedCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(activeSkill_draftCollection_draftAlternative1.isDraft).to.be.true;
          expect(activeSkill_draftCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(activeSkill_validatedCollection_archivedAlternative.isArchived).to.be.true;
          expect(activeSkill_validatedCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(draftSkill_archivedCollection_archivedProto.isArchived).to.be.true;
          expect(draftSkill_archivedCollection_archivedAlternative.isArchived).to.be.true;
          expect(draftSkill_archivedCollection_draftAlternative.isDraft).to.be.true;
          expect(draftSkill_archivedCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(draftSkill_draftCollection_draftProto.isDraft).to.be.true;
          expect(draftSkill_draftCollection_draftAlternative1.isDraft).to.be.true;
          expect(draftSkill_draftCollection_draftAlternative2.isDraft).to.be.true;
          expect(draftSkill_draftCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(otherLevelActiveSkill_validatedCollection_validatedProto.isValidated).to.be.true;
          expect(otherLevelActiveSkill_validatedCollection_validatedAlternative.isValidated).to.be.true;
          expect(activeSkill.isActive).to.be.true;
          expect(draftSkill.isDraft).to.be.true;
          expect(otherLevelActiveSkill.isActive).to.be.true;
        });
      });
      context('when the prototype belongs to a different skill than the one currently active', function() {
        it('should activate prototype\'s skill, and archive the previously active skill, by validating and archiving challenges accordingly', async function() {
          // given
          const challengeToValidateId = 'draftSkill_draftCollection_draftProto';
          const draftAlternativeToValidateId = 'draftSkill_draftCollection_draftAlternative1';
          tubeForEditorRepositoryStub.getByChallengeId.withArgs(challengeToValidateId).resolves(tube);
          tubeForEditorRepositoryStub.save.withArgs(tube).resolves();

          // when
          const validateChallengeCommand = { challengeId: challengeToValidateId, alternativeIdsToValidate: [draftAlternativeToValidateId], changelog: '' };
          await validateChallenge({
            validateChallengeCommand,
            tubeForEditorRepository: tubeForEditorRepositoryStub,
          });

          // then
          // changes
          expect(activeSkill_validatedCollection_validatedProto.isArchived).to.be.true;
          expect(activeSkill_validatedCollection_validatedAlternative.isArchived).to.be.true;
          expect(activeSkill_validatedCollection_draftAlternative.isOutdated).to.be.true;
          expect(draftSkill_draftCollection_draftProto.isValidated).to.be.true;
          expect(draftSkill_draftCollection_draftAlternative1.isValidated).to.be.true;
          expect(activeSkill.isArchived).to.be.true;
          expect(draftSkill.isActive).to.be.true;
          // remains the same
          expect(activeSkill_archivedCollection_archivedProto.isArchived).to.be.true;
          expect(activeSkill_archivedCollection_archivedAlternative.isArchived).to.be.true;
          expect(activeSkill_archivedCollection_draftAlternative.isDraft).to.be.true;
          expect(activeSkill_archivedCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(activeSkill_draftCollection_draftProto.isDraft).to.be.true;
          expect(activeSkill_draftCollection_draftAlternative1.isDraft).to.be.true;
          expect(activeSkill_draftCollection_draftAlternative2.isDraft).to.be.true;
          expect(activeSkill_draftCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(activeSkill_validatedCollection_archivedAlternative.isArchived).to.be.true;
          expect(activeSkill_validatedCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(draftSkill_archivedCollection_archivedProto.isArchived).to.be.true;
          expect(draftSkill_archivedCollection_archivedAlternative.isArchived).to.be.true;
          expect(draftSkill_archivedCollection_draftAlternative.isDraft).to.be.true;
          expect(draftSkill_archivedCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(draftSkill_draftCollection_draftAlternative2.isDraft).to.be.true;
          expect(draftSkill_draftCollection_outdatedAlternative.isOutdated).to.be.true;
          expect(otherLevelActiveSkill_validatedCollection_validatedProto.isValidated).to.be.true;
          expect(otherLevelActiveSkill_validatedCollection_validatedAlternative.isValidated).to.be.true;
          expect(otherLevelActiveSkill.isActive).to.be.true;
        });
      });
    });
  });
});
