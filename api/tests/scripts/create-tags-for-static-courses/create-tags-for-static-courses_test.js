import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addTagsFromCSVFile } from '../../../scripts/create-tags-for-static-courses/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { databaseBuilder } from '../../test-helper.js';

const CSV_CONTENT_OK = [
  'mon tag avec ç',
  'et puis @ tag',
  'ÉLEVE ',
  '&)=;)§61',
  'Mon panel',
  'bonjour et bienvenue dans ce t',
  'avec, une virgule',
];

describe('Script | create-tags-for-static-courses', () => {

  beforeEach(async () => {
    ['Brouillon', 'pouet'].map((label) => databaseBuilder.factory.buildStaticCourseTag({ label }));
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('static_courses_tags_link').del();
    await knex('static_course_tags').del();
  });

  it('should not copy tags from csv to the db when dryRun is true', async () => {
    // when
    await addTagsFromCSVFile({ dryRun: true, tagLabelsToInsert: CSV_CONTENT_OK });

    // then
    const actualLabels = await knex('static_course_tags').pluck('label').orderBy('label', 'ASC');
    expect(actualLabels).to.deep.equal(['Brouillon', 'pouet']);
  });

  it('should copy tags from csv to the db when dryRun is false', async () => {
    // when
    await addTagsFromCSVFile({ dryRun: false, tagLabelsToInsert: CSV_CONTENT_OK });

    // then
    const actualLabels = await knex('static_course_tags').pluck('label').orderBy('label', 'ASC');
    expect(actualLabels).to.deep.equal([
      '&)=;)§61',
      'Brouillon',
      'Mon panel',
      'avec, une virgule',
      'bonjour et bienvenue dans ce t',
      'et puis @ tag',
      'mon tag avec ç',
      'pouet',
      'ÉLEVE ',
    ]);
  });

  it('should add all tags except the ones that are already in database (case and diacritics insensitive)', async function() {
    // given
    databaseBuilder.factory.buildStaticCourseTag({ label: 'bonjOur Ét bienvenuE dans çe t' });
    await databaseBuilder.commit();

    // when
    await addTagsFromCSVFile({ dryRun: false, tagLabelsToInsert: CSV_CONTENT_OK });

    // then
    const actualLabels = await knex('static_course_tags').pluck('label').orderBy('label', 'ASC');
    expect(actualLabels).to.deep.equal([
      '&)=;)§61',
      'Brouillon',
      'Mon panel',
      'avec, une virgule',
      'bonjOur Ét bienvenuE dans çe t',
      'et puis @ tag',
      'mon tag avec ç',
      'pouet',
      'ÉLEVE ',
    ]);
  });

  it('should add all tags except the duplicates within the csv file (case and diacritics insensitive)', async function() {
    // given
    const CSV_CONTENT_KO_DUPS_FILE = [
      'Mon tag',
      'mon tAg',
      'mon tag ',
      'mon autre tag',
    ];

    // when
    await addTagsFromCSVFile({ dryRun: false, tagLabelsToInsert: CSV_CONTENT_KO_DUPS_FILE });

    // then
    const actualLabels = await knex('static_course_tags').pluck('label').orderBy('label', 'ASC');
    expect(actualLabels).to.deep.equal([
      'Brouillon',
      'mon autre tag',
      'pouet',
    ]);
  });

  it('should add all tags except the ones that are over 30 characters', async() => {
    const CSV_CONTENT_KO_LENGTH = [
      'un tag',
      'Signe diacritique ou diacritique (nom masculin), élément adjoint à une lettre d\'un alphabet pour en modifier la valeur ou pour distinguer des mots homographes. (Cet élément peut être suscrit [accents], souscrit [cédille] ou placé à côté de la lettre qu\'il modifie.)',
    ];

    // when
    await addTagsFromCSVFile({ dryRun: false, tagLabelsToInsert: CSV_CONTENT_KO_LENGTH });

    // then
    const actualLabels = await knex('static_course_tags').pluck('label').orderBy('label', 'ASC');
    expect(actualLabels).to.deep.equal([
      'Brouillon',
      'pouet',
      'un tag',
    ]);
  });
});
