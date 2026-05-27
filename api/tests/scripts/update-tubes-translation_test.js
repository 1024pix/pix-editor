import * as url from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, knex } from '../test-helper.js';
import { UpdateTubesTranslationScript, getTubeIdsFromPixFramework } from '../../scripts/update-tubes-translation.js';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

describe('Script | UpdateTubesTranslationScript', () => {
  let script;
  let logger;

  beforeEach(() => {
    script = new UpdateTubesTranslationScript();
    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe('#getTubeIdsFromPixFramework', () => {
    it('return tubes from Pix Framework', async() => {
      databaseBuilder.factory.buildChallengeInGroup({ framework: { name: 'POUET' } });
      const { thematic, tube } = databaseBuilder.factory.buildChallengeInGroup({});
      databaseBuilder.factory.buildTube({ id: 12, name: '@tube_un', thematicId: thematic.id });
      databaseBuilder.factory.buildTube({ id: 13, name: '@tube_un', thematicId: thematic.id });

      await databaseBuilder.commit();

      const tubes = await getTubeIdsFromPixFramework();
      expect(tubes).lengthOf(3);
      expect(tubes).deep.members([
        { id: tube.id, name: tube.name },
        { id: '12', name: '@tube_un' },
        { id: '13', name: '@tube_un' },
      ]);
    });
  });

  describe('#handle', () => {
    const testCsvFile = `${currentDirectory}files/update-tubes-translation-ok.csv`;

    describe('when dryRun is true', () => {
      it('should not update any tube translations', async () => {
        // given
        const { thematic } = databaseBuilder.factory.buildChallengeInGroup({});
        const tubeToUpdate = databaseBuilder.factory.buildTube({ id: 1, name: '@tube_un', thematicId: thematic.id });
        databaseBuilder.factory.buildTranslation({
          key: `tube.${tubeToUpdate.id}.practicalTitle`,
          locale: 'fr',
          value: 'mon titre',
        });

        databaseBuilder.factory.buildTranslation({
          key: `tube.${tubeToUpdate.id}.practicalDescription`,
          locale: 'fr',
          value: 'ma description',
        });

        await databaseBuilder.commit();

        // when
        const { options: scriptMeta } = script.metaInfo;
        const fileData = await scriptMeta.file.coerce(testCsvFile);

        const options = {
          file: fileData,
          dryRun: true,
        };

        await script.handle({ options, logger });

        // then
        const { value: frTitleTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalTitle`, locale: 'fr' }).first();
        expect(frTitleTranslation).equal('mon titre');

        const { value: frDescriptionTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalDescription`, locale: 'fr' }).first();
        expect(frDescriptionTranslation).equal('ma description');

        expect(logger.info).toHaveBeenCalledWith('Dry run is enabled, stopping before updating 1 tube(s)');
      });
    });

    describe('when csv file missing required column on coerce', () => {
      it('should throw an error', async () => {
        const { options: scriptMeta } = script.metaInfo;
        await expect(scriptMeta.file.coerce(`${currentDirectory}files/update-tubes-translation-missing-column-ko.csv`)).rejects.toThrow('MISSING_REQUIRED_FIELD_NAMES');
      });
    });

    it('update only given tubes translation', async () => {
      // given
      const { thematic } = databaseBuilder.factory.buildChallengeInGroup({});
      const tubeToUpdate = databaseBuilder.factory.buildTube({ id: 1, name: '@tube_un', thematicId: thematic.id });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalTitle`,
        locale: 'fr',
        value: 'mon titre',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalTitle`,
        locale: 'en',
        value: 'my title',
      });

      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalDescription`,
        locale: 'fr',
        value: 'ma description',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeToUpdate.id}.practicalDescription`,
        locale: 'en',
        value: 'my description',
      });

      await databaseBuilder.commit();

      // when
      const { options: scriptMeta } = script.metaInfo;
      const fileData = await scriptMeta.file.coerce(testCsvFile);

      const options = {
        file: fileData,
        dryRun: false,
      };

      await script.handle({ options, logger });

      // then
      const { value: frTitleTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalTitle`, locale: 'fr' }).first();
      expect(frTitleTranslation).equal('mon_nouveau_titre');

      const { value: frDescriptionTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalDescription`, locale: 'fr' }).first();
      expect(frDescriptionTranslation).equal('ma_nouvelle_description');

      const { value: enTitleTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalTitle`, locale: 'en' }).first();
      expect(enTitleTranslation).equal('my title');

      const { value: enDescriptionTranslation } = await knex('translations').select('value').where({ key: `tube.${tubeToUpdate.id}.practicalDescription`, locale: 'en' }).first();
      expect(enDescriptionTranslation).equal('my description');

      expect(logger.info).toHaveBeenCalledWith('Successfully updated translations for 1 tube(s)');
    });

    it('should ignore update tube translation when several tube has same name', async () => {
      // given
      const tubeId1 = 'tibeId1';
      const tubeId2 = 'tibeId2';
      const { thematic } = databaseBuilder.factory.buildChallengeInGroup({ tube: { id: tubeId1, name: '@tube_un' }, skill: { tubeId: tubeId1 } });
      databaseBuilder.factory.buildTube({ id: tubeId2, name: '@tube_un', thematicId: thematic.id });

      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeId1}.practicalDescription`,
        locale: 'fr',
        value: 'ma vielle description',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeId1}.practicalTitle`,
        locale: 'fr',
        value: 'mon vieux titre',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeId2}.practicalDescription`,
        locale: 'fr',
        value: 'ma vielle description 2',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeId2}.practicalTitle`,
        locale: 'fr',
        value: 'mon vieux titre 2',
      });
      await databaseBuilder.commit();

      const { options: scriptMeta } = script.metaInfo;
      const fileData = await scriptMeta.file.coerce(testCsvFile);

      const options = {
        file: fileData,
        dryRun: false,
      };

      // when
      await script.handle({ options, logger });

      // then
      const { value: frTitleTranslation1 } = await knex('translations').select('value').where({ key: `tube.${tubeId1}.practicalTitle`, locale: 'fr' }).first();
      expect(frTitleTranslation1).equal('mon vieux titre');

      const { value: frDescriptionTranslation1 } = await knex('translations').select('value').where({ key: `tube.${tubeId1}.practicalDescription`, locale: 'fr' }).first();
      expect(frDescriptionTranslation1).equal('ma vielle description');

      const { value: frTitleTranslation2 } = await knex('translations').select('value').where({ key: `tube.${tubeId2}.practicalTitle`, locale: 'fr' }).first();
      expect(frTitleTranslation2).equal('mon vieux titre 2');

      const { value: frDescriptionTranslation2 } = await knex('translations').select('value').where({ key: `tube.${tubeId2}.practicalDescription`, locale: 'fr' }).first();
      expect(frDescriptionTranslation2).equal('ma vielle description 2');

      expect(logger.error).toHaveBeenCalledWith('Found 2 tube(s) with name @tube_un', { tubeIds: [tubeId1, tubeId2] });
    });

    it('should ignore update tube translation when no tube has given name', async () => {
      // given
      const { options: scriptMeta } = script.metaInfo;
      const fileData = await scriptMeta.file.coerce(testCsvFile);

      const options = {
        file: fileData,
        dryRun: false,
      };

      // when
      await script.handle({ options, logger });

      // then
      expect(logger.error).toHaveBeenCalledWith('Found 0 tube(s) with name @tube_un', { tubeIds: [] });
    });
  });
});
