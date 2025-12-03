import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildGroup, buildFramework, buildArea, buildCompetence, buildThematic, buildTube, buildSkill, buildChallenge } from '../../../tooling/domain-builder/factory/index.js';
describe('Unit | Tooling | Domaine Builder | buildGroupe', function() {
  it('should build a challenge in grap', () => {
    // given
    const challenge = { id: 'challenge1' };

    // when
    const result = buildGroup(
      {
        type: 'challenge',
        challenges: [challenge],
      },
    );

    // then
    expect(result).toEqual([
      [buildFramework({ id: 'frameworkId1', name: 'Pix', areaIds: ['areaId1'] })],
      [buildArea({ id: 'areaId1', competenceIds: ['competenceId1'], frameworkId: 'frameworkId1' })],
      [
        buildCompetence({
          id: 'competenceId1',
          areaId: 'areaId1',
          skillIds: ['skillId1'],
          tubeIds: ['tubeId1'],
          thematicIds: ['thematicId1'],
        }),
      ],
      [buildThematic({ id: 'thematicId1', tubeIds: ['tubeId1'] })],
      [buildTube({ id: 'tubeId1', skillIds: ['skillId1'] })],
      [buildSkill({ id: 'skillId1', challengeIds: [challenge.id] })],
      [buildChallenge(challenge)],
    ]);
  });

  it('should build challenges in grap', () => {
    // given
    const challenges = [
      { id: 'challenge1' },
      { id: 'challenge2' },
      { id: 'challenge3' },
    ];

    // when
    const result = buildGroup(
      {
        type: 'challenge',
        challenges,
      },
    );

    // then
    expect(result).toEqual([
      [buildFramework({ id: 'frameworkId1', name: 'Pix', areaIds: ['areaId1'] })],
      [buildArea({ id: 'areaId1', competenceIds: ['competenceId1'], frameworkId: 'frameworkId1' })],
      [
        buildCompetence({
          id: 'competenceId1',
          areaId: 'areaId1',
          skillIds: ['skillId1'],
          tubeIds: ['tubeId1'],
          thematicIds: ['thematicId1'],
        }),
      ],
      [buildThematic({ id: 'thematicId1', tubeIds: ['tubeId1'] })],
      [buildTube({ id: 'tubeId1', skillIds: ['skillId1'] })],
      [
        buildSkill({
          id: 'skillId1',
          challengeIds: [
            'challenge1',
            'challenge2',
            'challenge3',
          ],
        }),
      ],
      challenges.map(buildChallenge),
    ]);
  });
  it('should build skills and challenges in grap', () => {
    // given
    ;
    const skills = [
      {
        id: 'skill1',
        challenges: [{ id: 'challenge1' }, { id: 'challenge2' }],
      },
      {
        id: 'skill2',
        challenges: [{ id: 'challenge3' }],
      },
    ];

    // when
    const result = buildGroup(
      {
        type: 'skill',
        skills,
      },
    );

    // then
    expect(result).toEqual([
      [buildFramework({ id: 'frameworkId1', name: 'Pix', areaIds: ['areaId1'] })],
      [buildArea({ id: 'areaId1', competenceIds: ['competenceId1'], frameworkId: 'frameworkId1' })],
      [
        buildCompetence({
          id: 'competenceId1',
          areaId: 'areaId1',
          skillIds: ['skill1', 'skill2'],
          tubeIds: ['tubeId1'],
          thematicIds: ['thematicId1'],
        }),
      ],
      [buildThematic({ id: 'thematicId1', tubeIds: ['tubeId1'] })],
      [buildTube({ id: 'tubeId1', skillIds: ['skill1', 'skill2'] })],
      [
        buildSkill({
          id: 'skill1',
          challengeIds: ['challenge1', 'challenge2'],
        }),
        buildSkill({
          id: 'skill2',
          challengeIds: ['challenge3'],
        }),
      ],
      [
        buildChallenge({ id: 'challenge1' }),
        buildChallenge({ id: 'challenge2' }),
        buildChallenge({ id: 'challenge3' }),
      ],
    ]);
  });
});
