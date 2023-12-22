import { describe, it, vi, expect } from 'vitest';
import { domainBuilder } from '../../../test-helper';

import { findAllMissions } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Usecases | find all missions', function() {
  it('should return a list of mission summaries', async () => {
    // given
    const competence1 = domainBuilder.buildCompetence({
      id: 'recCompetence1',
      index: '1.1',
      name_i18n: {
        fr: 'Nom compétence 1',
        en: 'Competence 1 name',
      },
    });
    const competence2 = domainBuilder.buildCompetence({
      id: 'recCompetence2',
      index: '2.2',
      name_i18n: {
        fr: 'Nom compétence 2',
        en: 'Competence 1 name',
      },
    });

    const mission1 = domainBuilder.buildMission({
      id: 3,
      competenceId: 'recCompetence1',
    });
    const mission2 = domainBuilder.buildMission({
      id: 4,
      name: 'Alt name',
      competenceId: 'recCompetence2',
    });

    const competenceRepository = {
      getMany: vi.fn().mockResolvedValueOnce([competence1, competence2]),
    };
    const meta = Symbol('meta');
    const missionRepository = {
      findAllMissions: vi.fn().mockResolvedValueOnce({ missions: [mission1, mission2], meta }),
    };

    // when
    const params = { filter: { isActive: false }, page: { number: 1, size: 20 } };
    const result = await findAllMissions(params, { missionRepository, competenceRepository });

    // then
    const missionSummary1 = domainBuilder.buildMissionSummary({
      id: 3,
      competence: '1.1 Nom compétence 1'
    });
    const missionSummary2 = domainBuilder.buildMissionSummary({
      id: 4,
      name: 'Alt name',
      competence: '2.2 Nom compétence 2'
    });

    expect(result).toEqual({ missions: [missionSummary1, missionSummary2], meta });
    expect(missionRepository.findAllMissions).to.toHaveBeenCalledWith(params);
    expect(competenceRepository.getMany).to.toHaveBeenCalledWith(['recCompetence1', 'recCompetence2']);
  });

  describe('When there is no competence found', function() {
    it('should specify there is no competence', async () => {
      // given
      const competence = domainBuilder.buildCompetence({
        id: 'recCompetence',
        index: '2.2',
        name_i18n: {
          fr: 'Nom compétence',
          en: 'Competence 1 name',
        },
      });
      const mission = domainBuilder.buildMission({
        id: 4,
        competenceId: 'recCompetence2',
      });

      const competenceRepository = {
        getMany: vi.fn().mockResolvedValueOnce([competence]),
      };
      const meta = Symbol('meta');
      const missionRepository = {
        findAllMissions: vi.fn().mockResolvedValueOnce({ missions: [mission], meta }),
      };

      // when
      const result = await findAllMissions(
        { filter: { isActive: false }, page: { number: 1, size: 20 } },
        { missionRepository, competenceRepository }
      );

      // then
      const missionSummary = domainBuilder.buildMissionSummary({
        ...mission, competence: 'Compétence non trouvée : recCompetence2'
      });
      expect(result).toEqual({ missions: [missionSummary], meta });
    });
  });
});
