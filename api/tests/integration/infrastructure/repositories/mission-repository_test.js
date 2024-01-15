import { omit } from 'lodash';
import { describe, describe as context, beforeEach, expect, expectTypeOf, it } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { findAllMissions, save, list } from '../../../../lib/infrastructure/repositories/mission-repository.js';
import { Mission } from '../../../../lib/domain/models/index.js';

describe('Integration | Repository | mission-repository', function() {

  beforeEach(async function() {
    await knex('translations').delete();
    await knex('missions').delete();
  });

  describe('#findAllMissions', function() {
    context('When there are missions', function() {
      it('should return all missions', async function() {
        databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.ACTIVE });
        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.INACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives'
        });
        await databaseBuilder.commit();

        const results = await findAllMissions({ filter: { isActive: false }, page: { number: 1, size: 20 } });

        expect(results.missions).to.deep.equal([new Mission({
          id: 1,
          name_i18n: { fr: 'Ma première mission' },
          competenceId: 'competenceId',
          thematicId: 'thematicId',
          learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
          validatedObjectives_i18n: { fr: 'Rien' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        }), new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicId: 'thematicId',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.INACTIVE,
          createdAt: new Date('2010-01-04'),
        })]);
        expect(results.meta).to.deep.equal({
          page: 1,
          pageSize: 20,
          rowCount: 2,
          pageCount: 1,
        });
      });
    });
    context('When there are no missions', function() {
      it('should return an empty list', async function() {

        const results = await findAllMissions({ filter: { isActive: false }, page: { number: 1, size: 20 } });

        expect(results.missions.length).to.equal(0);
        expect(results.meta).to.deep.equal({
          page: 1,
          pageSize: 20,
          rowCount: 0,
          pageCount: 0,
        });
      });
    });
    context('With isActive filter', function() {
      context('with results', function() {
        it('should return all active missions', async function() {
          const activeMission = databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.ACTIVE });
          databaseBuilder.factory.buildMission({ id: 2, status: Mission.status.INACTIVE });
          await databaseBuilder.commit();

          const results = await findAllMissions({ filter: { isActive: true }, page: { number: 1, size: 20 } });

          expect(results.missions.length).to.equal(1);
          expect(results.missions[0].id).to.equal(activeMission.id);
          expect(results.meta).to.deep.equal({
            page: 1,
            pageSize: 20,
            rowCount: 1,
            pageCount: 1,
          });
        });
      });
      context('with no results', function() {
        it('should return an empty list of missions', async function() {
          databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.INACTIVE });
          databaseBuilder.factory.buildMission({ id: 2, status: Mission.status.INACTIVE });
          await databaseBuilder.commit();

          const results = await findAllMissions({ filter: { isActive: true }, page: { number: 1, size: 20 } });

          expect(results.missions.length).to.equal(0);
          expect(results.meta).to.deep.equal({
            page: 1,
            pageSize: 20,
            rowCount: 0,
            pageCount: 0,
          });
        });
      });
    });
  });

  describe('list', function()  {

    it('Should return all missions', async function() {

      databaseBuilder.factory.buildMission({
        id: 1,
        status: Mission.status.ACTIVE
      });

      databaseBuilder.factory.buildMission({
        id: 2,
        name: 'Alt name',
        status: Mission.status.INACTIVE,
        learningObjectives: 'Alt objectives',
        validatedObjectives: 'Alt validated objectives'
      });

      await databaseBuilder.commit();

      const result = await list();

      expect(result).to.deep.equal([new Mission({
        id: 1,
        name_i18n: { fr: 'Ma première mission' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
        validatedObjectives_i18n: { fr: 'Rien' },
        status: Mission.status.ACTIVE,
        createdAt: new Date('2010-01-04'),
      }), new Mission({
        id: 2,
        name_i18n: { fr: 'Alt name' },
        competenceId: 'competenceId',
        thematicId: 'thematicId',
        learningObjectives_i18n: { fr: 'Alt objectives' },
        validatedObjectives_i18n: { fr: 'Alt validated objectives' },
        status: Mission.status.INACTIVE,
        createdAt: new Date('2010-01-04'),
      })]);

    });
  });

  describe('#save', function() {

    it('should store mission', async function() {
      const mission = new Mission({
        name_i18n: { fr: 'Mission impossible'  },
        competenceId: 'AZERTY',
        thematicId: 'QWERTY',
        learningObjectives_i18n:  { fr: null },
        validatedObjectives_i18n: { fr: 'Très bien' },
        status: Mission.status.INACTIVE,
      });

      const savedMission = await save(mission);
      expectTypeOf(savedMission).toEqualTypeOf('Mission');
      await expect(omit(savedMission, ['createdAt'])).to.deep.equal(omit(new Mission({ ...mission, id: savedMission.id }), ['createdAt']));

      const expectedMission = {
        id: savedMission.id,
        competenceId: 'AZERTY',
        thematicId: 'QWERTY',
        status: Mission.status.INACTIVE,
      };

      const missionFromDb = await knex('missions').where({ id: savedMission.id }).first().select('competenceId', 'thematicId', 'status', 'id');
      await expect(missionFromDb).to.deep.equal(expectedMission);
    });

    it('should store I18n for mission', async function() {

      const mission = new Mission({
        name_i18n: { fr: 'Mission impossible'  },
        competenceId: 'AZERTY',
        thematicId: 'QWERTY',
        learningObjectives_i18n:  { fr: 'au boulot' },
        validatedObjectives_i18n: { fr: 'Très bien' },
        status: Mission.status.INACTIVE,
      });

      const savedMission = await save(mission);

      const translations = [
        {
          key: `mission.${savedMission.id}.name`,
          locale: 'fr',
          value: 'Mission impossible'
        },
        {
          key: `mission.${savedMission.id}.learningObjectives`,
          locale: 'fr',
          value: 'au boulot',
        },
        {
          key: `mission.${savedMission.id}.validatedObjectives`,
          locale: 'fr',
          value: 'Très bien'
        }
      ];

      expect(await knex('translations').select('*')).to.deep.equal(translations);
    });
  });
});

