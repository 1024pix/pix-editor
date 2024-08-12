import { describe, describe as context, expect, it } from 'vitest';
import { MissionIntroductionMediaError } from '../../../../lib/domain/errors.js';
import { createMission } from '../../../../lib/domain/usecases/index.js';
import { Mission } from '../../../../lib/domain/models/index.js';

describe('Integration | Usecases | Create mission', function() {
  context('When the mission has a media url without a type', function() {
    it('should return an error MissionIntroductionMediaError', async () => {
      // given
      const missionToSave = new Mission({
        name_i18n: { fr: 'new mission'  },
        competenceId: 'QWERTY',
        thematicIds: 'Thematic',
        learningObjectives_i18n:  { fr: null },
        validatedObjectives_i18n: { fr: 'Très bien' },
        introductionMediaType: null,
        introductionMediaUrl: 'http://example.net',
        introductionMediaAlt: null,
        status: Mission.status.INACTIVE,
        createdAt: new Date('2023-12-25')
      });

      // when
      const promise = createMission(missionToSave);

      // then
      await expect(promise).rejects.to.deep.equal(new MissionIntroductionMediaError('Opération impossible car la mission n\'a pas de type pour le media d\'introduction.'));

    });
  });
  context('When the mission has a media type without an url', function() {
    it('should return an error MissionIntroductionMediaError', async () => {
      // given
      const missionToSave = new Mission({
        name_i18n: { fr: 'new mission'  },
        competenceId: 'QWERTY',
        thematicIds: 'Thematic',
        learningObjectives_i18n:  { fr: null },
        validatedObjectives_i18n: { fr: 'Très bien' },
        introductionMediaType: 'image',
        introductionMediaUrl: null,
        introductionMediaAlt: null,
        status: Mission.status.INACTIVE,
        createdAt: new Date('2023-12-25')
      });

      // when
      const promise = createMission(missionToSave);

      // then
      await expect(promise).rejects.to.deep.equal(new MissionIntroductionMediaError('Opération impossible car la mission ne peut avoir de type de média sans URL pour ce dernier.'));

    });
  });
});

