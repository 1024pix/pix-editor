import { describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';

describe('Unit | Tooling | database Builder | buildGroup', function() {
  it('should build a challenge in group', async () => {
    // given
    const challenge = { id: 'challenge1' };

    // when
    const result = databaseBuilder.factory.buildChallengeInGroup({ challenge });
    await databaseBuilder.commit();

    const challengeCreated = await knex('challenges').select('*').where('id', challenge.id).first();

    // then
    expect(result.challenge).deep.equal({
      id: 'challenge1',
      type: 'QCM',
      t1Status: true,
      t2Status: false,
      t3Status: true,
      status: 'validé',
      skillId: challengeCreated.skillId,
      embedHeight: 500,
      timer: 1234,
      format: 'mots',
      autoReply: false,
      locales: [],
      focusable: false,
      genealogy: 'Prototype 1',
      pedagogy: 'q-situation',
      author: ['SPS'],
      declinable: 'facilement',
      version: 1,
      alternativeVersion: 2,
      accessibility1: 'OK',
      accessibility2: 'RAS',
      spoil: 'Non Sp',
      responsive: 'Non',
      shuffled: false,
      createdAt: new Date('1986-07-14T00:00:00Z'),
      updatedAt: new Date('2021-10-04T00:00:00Z'),
      validatedAt: new Date('2023-02-02T14:17:30Z'),
      archivedAt: new Date('2023-03-03T10:47:05Z'),
      madeObsoleteAt: new Date('2023-04-04T10:47:05Z'),
      isQualityOk: false,
      assessmentMaintenanceTags: ['Prénom ou nom propre dans un embed ou dans du HTML intégré à l’épreuve', 'Anglicismes à reformuler'],
      translationMaintenanceTags: ['règle, législation ou connaissance', 'réponses ambiguës'],
    });
    expect(result.localizedChallenge).deep.equal({
      id: 'challenge1',
      challengeId: 'challenge1',
      locale: 'fr',
      embedUrl: 'https://github.io/page/epreuve.html',
      status: null,
      geography: 'FR',
      urlsToConsult: ['truc.fr'],
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: 'OK',
      isAwarenessChallenge: true,
      toRephrase: true,
      hasEmbedInternalValidation: true,
      noValidationNeeded: true,
      validatedAt: null,
    });
    expect(result.skill).deep.equal({
      id: result.skill.id,
      status: 'actif',
      hintStatus: 'Validé',
      descriptionStatus: 'Validé',
      description: 'skill description',
      level: 5,
      internationalisation: 'Monde',
      version: 1,
      tubeId: result.skill.tubeId,
      activatedAt: undefined,
      archivedAt: undefined,
      obsoletedAt: undefined,
      createdAt: new Date('1986-07-14T00:00:00Z'),
      updatedAt: undefined,
      tutorialIds: [],
      learningMoreTutorialIds: [],
    });
    expect(result.tube).deep.equal({
      id: result.tube.id,
      name: '@tube',
      index: undefined,
      thematicId: result.tube.thematicId,
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(result.thematic).deep.equal({
      id: result.thematic.id,
      index: undefined,
      competenceId: result.thematic.competenceId,
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(result.competence).deep.equal({
      id: result.competence.id,
      index: '1.1',
      areaId: result.competence.areaId,
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(result.area).deep.equal({
      id: result.area.id,
      code: '1',
      color: undefined,
      frameworkId: result.area.frameworkId,
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(result.framework).deep.equal({
      id: result.framework.id,
      name: 'Pix',
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(result.translations).deep.equal([
      {
        key: 'challenge.challenge1.instruction',
        locale: 'fr',
        value: 'Le cœur des boys',
        model: 'challenge',
        entityId: 'challenge1',
      },
      {
        key: 'challenge.challenge1.alternativeInstruction',
        locale: 'fr',
        value: " j'ai blessé",
        model: 'challenge',
        entityId: 'challenge1',
      },
      {
        key: 'challenge.challenge1.embedTitle',
        locale: 'fr',
        value: "j'ai ghost",
        model: 'challenge',
        entityId: 'challenge1',
      },
      {
        key: 'challenge.challenge1.illustrationAlt',
        locale: 'fr',
        value: 'Gadget de Spice Girl',
        model: 'challenge',
        entityId: 'challenge1',
      },
      {
        key: 'challenge.challenge1.solution',
        locale: 'fr',
        value: '1, 5',
        model: 'challenge',
        entityId: 'challenge1',
      },
      {
        key: 'challenge.challenge1.solutionToDisplay',
        locale: 'fr',
        value: 'c 1 et 5',
        model: 'challenge',
        entityId: 'challenge1',
      },
      {
        key: 'challenge.challenge1.proposals',
        locale: 'fr',
        value: '- 1\n- 2\n- 3\n- 4\n- 5',
        model: 'challenge',
        entityId: 'challenge1',
      },
    ]);
  });
});
