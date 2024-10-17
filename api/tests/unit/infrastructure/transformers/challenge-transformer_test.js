import { describe, expect, it } from 'vitest';
import { createChallengeTransformer, fillAlternativeQualityFieldsFromMatchingProto } from '../../../../lib/infrastructure/transformers/index.js';
import { Challenge, Skill } from '../../../../lib/domain/models/index.js';
import { domainBuilder } from '../../../test-helper.js';
import { Attachment, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Infrastructure | Challenge Transformer', function() {

  describe('#createChallengeTransformer', function() {

    it('should transform challenge', () => {
      // given
      const attachments = [];
      const challenge = domainBuilder.buildChallenge({
        id: 'challenge-id',
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: 'A tester',
        accessibility2: 'KO',
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'challenge-id',
            challengeId: 'challenge-id',
            locale: 'fr',
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            isAwarenessChallenge: true,
            toRephrase: true,
          })
        ]
      });

      // when
      const transform = createChallengeTransformer({ attachments });
      const result = transform(challenge);

      // then
      expect(result).to.deep.equal(
        _buildReleaseChallenge(challenge),
      );
    });

    describe('when there are attachments', () => {
      it('should add these on the challenge', () => {
        // given
        const attachments = [
          {
            id: 'attId1',
            url: 'https://dl.example.com/attachment1.xlsx',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
          {
            id: 'attId2',
            url: 'https://dl.example.com/attachment1.csv',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
        ];
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          translations: {
            fr: {
              instruction: 'Consigne',
              alternativeInstruction: 'Consigne alternative',
              proposals: 'Propositions',
            },
          },
          locales: ['fr', 'fr-fr'],
          files: attachments.map(({ id: fileId, localizedChallengeId }) => ({ fileId, localizedChallengeId }))
        });

        // when
        const transform = createChallengeTransformer({ attachments });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge({
            ...challenge,
            attachments: [
              'https://dl.example.com/attachment1.xlsx',
              'https://dl.example.com/attachment1.csv',
            ],
          }),
        );
      });
    });

    describe('when there is an illustration attachments', () => {
      it('should add it on the challenge', () => {
        // given
        const attachments = [
          {
            id: 'attId1',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'https://dl.example.com/illustration1.jpg',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id',
          },
          {
            id: 'attId2',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'https://dl.example.com/illustration2.jpg',
            challengeId: 'other-challenge-id',
            localizedChallengeId: 'other-challenge-id',
          },
          {
            id: 'attId3',
            type: Attachment.TYPES.ILLUSTRATION,
            url: 'https://dl.example.com/illustration1-nl.jpg',
            challengeId: 'challenge-id',
            localizedChallengeId: 'challenge-id-nl',
          },
        ];
        const challenge = domainBuilder.buildChallenge({
          id: 'challenge-id',
          translations: {
            fr: {
              instruction: 'Consigne',
              alternativeInstruction: 'Consigne alternative',
              proposals: 'Propositions',
              illustrationAlt: 'Un chien qui fait des bulles avec son museau'
            },
          },
          locales: ['fr', 'fr-fr'],
          files: attachments.map(({ id: fileId, localizedChallengeId }) => ({ fileId, localizedChallengeId }))
        });

        // when
        const transform = createChallengeTransformer({ attachments });
        const result = transform(challenge);

        // then
        expect(result).to.deep.equal(
          _buildReleaseChallenge({
            ...challenge,
            illustrationAlt: 'Un chien qui fait des bulles avec son museau',
            illustrationUrl: 'https://dl.example.com/illustration1.jpg',
          }),
        );
      });
    });
  });

  describe('#fillAlternativeFieldsFromProto', () => {
    it('should fill same quality attributes from prototype for all challenges by skill and version', () => {
      // given
      const skill1 = {
        id: 'skill1',
        name: 'skill1',
      };

      const skill2 = {
        id: 'skill2',
        name: 'skill2',
      };
      const challengeProto1Skill1DTO = {
        id: 'challengeProto1Skill1',
        skillId: skill1.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeProto1Skill1',
          challengeId: 'challengeProto1Skill1',
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
          isAwarenessChallenge: false,
          toRephrase: false,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        version: '1',
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      };
      const challengeAlternative1Skill1DTO = {
        id: 'challengeAlternative1Skill1',
        skillId:  skill1.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeAlternative1Skill1',
          challengeId: 'challengeAlternative1Skill1',
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.RAS,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        version: '1',
        genealogy: Challenge.GENEALOGIES.DECLINAISON
      };

      const challengeProto2Skill1DTO = {
        id: 'challengeProto2Skill1',
        skillId: skill1.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeProto2Skill1',
          challengeId: 'challengeProto2Skill1',
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: true,
          toRephrase: true,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.OK,
        version: '2',
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      };
      const challengeAlternative2Skill1DTO = {
        id: 'challengeAlternative2Skill1',
        skillId: skill1.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeAlternative2Skill1',
          challengeId: 'challengeAlternative2Skill1',
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        version: '2',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
      };

      const challengeProto1Skill2DTO = {
        id: 'challengeProto1Skill2',
        skillId: skill2.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeProto1Skill2',
          challengeId: 'challengeProto1Skill2',
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.RAS,
        accessibility2: Challenge.ACCESSIBILITY2.OK,
        version: '1',
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      };
      const challengeAlternative1Skill2DTO = {
        id: 'challengeAlternative1Skill2',
        skillId: skill2.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeAlternative1Skill2',
          challengeId: 'challengeAlternative1Skill2',
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        version: '1',
        genealogy: Challenge.GENEALOGIES.DECLINAISON
      };

      const challengeProto1Skill1 = domainBuilder.buildChallenge(challengeProto1Skill1DTO);
      const challengeAlternative1Skill1 = domainBuilder.buildChallenge(challengeAlternative1Skill1DTO);
      const challengeProto2Skill1 = domainBuilder.buildChallenge(challengeProto2Skill1DTO);
      const challengeAlternative2Skill1 = domainBuilder.buildChallenge(challengeAlternative2Skill1DTO);
      const challengeProto1Skill2 = domainBuilder.buildChallenge(challengeProto1Skill2DTO);
      const challengeAlternative1Skill2 = domainBuilder.buildChallenge(challengeAlternative1Skill2DTO);

      const skills = [
        domainBuilder.buildSkill(skill1),
        domainBuilder.buildSkill(skill2),
      ];

      // when
      fillAlternativeQualityFieldsFromMatchingProto([
        challengeProto1Skill1,
        challengeAlternative1Skill1,
        challengeProto2Skill1,
        challengeAlternative2Skill1,
        challengeProto1Skill2,
        challengeAlternative1Skill2,
      ], skills);

      // then
      expect(challengeProto1Skill1).to.deep.equal(domainBuilder.buildChallenge(challengeProto1Skill1DTO));
      expect(challengeAlternative1Skill1).to.deep.equal({
        ...domainBuilder.buildChallenge({
          ...challengeAlternative1Skill1DTO,
          accessibility1: challengeProto1Skill1DTO.accessibility1,
          accessibility2: challengeProto1Skill1DTO.accessibility2,
        }),
        requireGafamWebsiteAccess: challengeProto1Skill1.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: challengeProto1Skill1.isIncompatibleIpadCertif,
        deafAndHardOfHearing: challengeProto1Skill1.deafAndHardOfHearing,
        isAwarenessChallenge: challengeProto1Skill1.isAwarenessChallenge,
        toRephrase: challengeProto1Skill1.toRephrase,
      });

      expect(challengeProto2Skill1).to.deep.equal(domainBuilder.buildChallenge(challengeProto2Skill1DTO));
      expect(challengeAlternative2Skill1).to.deep.equal({
        ...domainBuilder.buildChallenge({
          ...challengeAlternative2Skill1DTO,
          accessibility1: challengeProto2Skill1DTO.accessibility1,
          accessibility2: challengeProto2Skill1DTO.accessibility2,
        }),
        requireGafamWebsiteAccess: challengeProto2Skill1.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: challengeProto2Skill1.isIncompatibleIpadCertif,
        deafAndHardOfHearing: challengeProto2Skill1.deafAndHardOfHearing,
        isAwarenessChallenge: challengeProto2Skill1.isAwarenessChallenge,
        toRephrase: challengeProto2Skill1.toRephrase,
      });

      expect(challengeProto1Skill2).to.deep.equal(domainBuilder.buildChallenge(challengeProto1Skill2DTO));
      expect(challengeAlternative1Skill2).to.deep.equal({
        ...domainBuilder.buildChallenge({
          ...challengeAlternative1Skill2DTO,
          accessibility1: challengeProto1Skill2DTO.accessibility1,
          accessibility2: challengeProto1Skill2DTO.accessibility2,
        }),
        requireGafamWebsiteAccess: challengeProto1Skill2.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: challengeProto1Skill2.isIncompatibleIpadCertif,
        deafAndHardOfHearing: challengeProto1Skill2.deafAndHardOfHearing,
        isAwarenessChallenge: challengeProto1Skill2.isAwarenessChallenge,
        toRephrase: challengeProto1Skill2.toRephrase,
      });
    });

    it('shouldn\'t alter challenges from workbench', () => {
      // given
      const workbenchSkill = {
        id: 'skill3',
        name: Skill.WORKBENCH_NAME,
      };

      const challengeProtoWorkbench1DTO  = {
        id: 'challengeProtoWorkbench1',
        skillId: workbenchSkill.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoWorkbench1',
          challengeId: 'challengeProtoWorkbench1',
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        version: null,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,

      };

      const challengeProtoWorkbench2DTO  = {
        id: 'challengeProtoWorkbench2',
        skillId: workbenchSkill.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeProtoWorkbench2',
          challengeId: 'challengeProtoWorkbench2',
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: false,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        version: null,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE
      };

      const challengeProtoWorkbench1 = domainBuilder.buildChallenge(challengeProtoWorkbench1DTO);
      const challengeProtoWorkbench2 = domainBuilder.buildChallenge(challengeProtoWorkbench2DTO);

      const skills = [
        domainBuilder.buildSkill(workbenchSkill),
      ];

      // when
      fillAlternativeQualityFieldsFromMatchingProto([
        challengeProtoWorkbench1,
        challengeProtoWorkbench2,
      ], skills);

      // then
      expect(challengeProtoWorkbench1).to.deep.equal(domainBuilder.buildChallenge(challengeProtoWorkbench1DTO));
      expect(challengeProtoWorkbench2).to.deep.equal(domainBuilder.buildChallenge(challengeProtoWorkbench2DTO));
    });

    it('shouldn\'t alter challenges without prototype', () => {
      // given
      const skill1 = {
        id: 'skill1',
        name: 'skill1',
      };

      const challengeAlternative1Skill1DTO = {
        id: 'challengeAlternative3Skill1',
        skillId: skill1.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeAlternative3Skill1',
          challengeId: 'challengeAlternative3Skill1',
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        version: '3',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
      };

      const challengeAlternative2Skill1DTO = {
        id: 'challengeAlternative3Skill1',
        skillId: skill1.id,
        translations: {
          fr: {
            instruction: 'Consigne',
            alternativeInstruction: 'Consigne alternative',
            proposals: 'Propositions',
          },
        },
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: 'challengeAlternative3Skill1',
          challengeId: 'challengeAlternative3Skill1',
          requireGafamWebsiteAccess: false,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
          isAwarenessChallenge: false,
          toRephrase: false,
        })],
        locales: ['fr', 'fr-fr'],
        files: [],
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        version: '3',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
      };
      const challengeAlternative1Skill1 = domainBuilder.buildChallenge(challengeAlternative1Skill1DTO);
      const challengeAlternative2Skill1 = domainBuilder.buildChallenge(challengeAlternative2Skill1DTO);
      const skills = [
        domainBuilder.buildSkill(skill1),
      ];

      // when
      fillAlternativeQualityFieldsFromMatchingProto([
        challengeAlternative1Skill1,
        challengeAlternative2Skill1
      ], skills);

      // then
      expect(challengeAlternative1Skill1).to.deep.equal(domainBuilder.buildChallenge(challengeAlternative1Skill1DTO));
      expect(challengeAlternative2Skill1).to.deep.equal(domainBuilder.buildChallenge(challengeAlternative2Skill1DTO));
    });
  });
});

function _buildReleaseChallenge({
  id,
  instruction,
  proposals,
  type,
  solution,
  solutionToDisplay,
  t1Status,
  t2Status,
  t3Status,
  status,
  skillId,
  embedUrl,
  embedTitle,
  embedHeight,
  timer,
  competenceId,
  format,
  autoReply,
  locales,
  alternativeInstruction,
  genealogy,
  responsive,
  focusable,
  delta,
  alpha,
  attachments,
  illustrationUrl = null,
  illustrationAlt = null,
  shuffled,
  alternativeVersion,
  accessibility1,
  accessibility2,
  requireGafamWebsiteAccess,
  isIncompatibleIpadCertif,
  deafAndHardOfHearing,
  isAwarenessChallenge,
  toRephrase,
}) {
  const releaseChallenge = {
    id,
    instruction,
    proposals,
    type,
    solution,
    solutionToDisplay,
    t1Status,
    t2Status,
    t3Status,
    status,
    skillId,
    embedUrl,
    embedTitle,
    embedHeight,
    timer,
    competenceId,
    format,
    autoReply,
    locales,
    alternativeInstruction,
    genealogy,
    responsive,
    focusable,
    delta,
    alpha,
    illustrationUrl,
    illustrationAlt,
    shuffled,
    alternativeVersion,
    accessibility1,
    accessibility2,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
  };
  if (attachments) {
    releaseChallenge.attachments = attachments;
  }
  return releaseChallenge;
}
