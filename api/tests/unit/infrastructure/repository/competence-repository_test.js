import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper';
import { competenceDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { competenceRepository, translationRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Unit | Repository | competence-repository', () => {

  describe('#getMany', () => {
    it('should return the list of all competences having given ids with translations', async () => {
      // given
      vi.spyOn(competenceDatasource, 'filter').mockResolvedValue([
        domainBuilder.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
        }),
        domainBuilder.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
        }),
      ]);

      vi.spyOn(translationRepository, 'listByPrefix')
        .mockResolvedValueOnce([{
          key: 'competence.competence1.name',
          locale: 'fr',
          value: 'Nom compétence 1',
        }, {
          key: 'competence.competence1.description',
          locale: 'fr',
          value: 'Description compétence 1',
        }, {
          key: 'competence.competence1.name',
          locale: 'en',
          value: 'Competence 1 name',
        }, {
          key: 'competence.competence1.description',
          locale: 'en',
          value: 'Competence 1 description',
        }, {
          key: 'competence.competence2.name',
          locale: 'fr',
          value: 'Nom compétence 2',
        }, {
          key: 'competence.competence2.description',
          locale: 'fr',
          value: 'Description compétence 2',
        }, {
          key: 'competence.competence2.name',
          locale: 'en',
          value: 'Competence 2 name',
        }, {
          key: 'competence.competence2.description',
          locale: 'en',
          value: 'Competence 2 description',
        }]);

      // when
      const competences = await competenceRepository.getMany(['competence1', 'competence2']);

      // then
      expect(competenceDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['competence1', 'competence2'] } });
      expect(translationRepository.listByPrefix).toHaveBeenCalledWith('competence.');
      expect(competences).toEqual([
        domainBuilder.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          name_i18n: {
            fr: 'Nom compétence 1',
            en: 'Competence 1 name',
          },
          description_i18n: {
            fr: 'Description compétence 1',
            en: 'Competence 1 description',
          }
        }),
        domainBuilder.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          name_i18n: {
            fr: 'Nom compétence 2',
            en: 'Competence 2 name',
          },
          description_i18n: {
            fr: 'Description compétence 2',
            en: 'Competence 2 description',
          }
        }),
      ]);
    });
  });
});
