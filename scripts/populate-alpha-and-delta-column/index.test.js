import { describe, expect, it, vi } from 'vitest';
import _ from 'lodash';
import airtable from 'airtable';
const { Record: AirtableRecord } = airtable;

import { matchData, findAirtableIds, updateRecords } from './index.js';
import { parseData } from '../populate-alpha-and-delta-column-with-csv/index.js';

describe('Populate alpha and delta column', function() {
  describe('#parseData', function() {
    describe('when an expected header is missing', function() {
      it('should throw an error', async function() {
        const data = 'missing,difficulties\nrec1,0.8423189520825876\nrec2,-0.9423189520825878';
        const dataPromise = parseData(data);
        const parseDataError = await dataPromise.catch((error) => error);

        expect(parseDataError).to.deep.equal(new Error('Missing header: items,discriminants'));
      });
    });
  });

  describe('#matchData', function() {
    it('should return a object table with challenge persistent id, alpha and delta',  async function() {
      const csvData = 'ChallengeIdHash,challengeId\nhash1,recPix1\nhash2,recPix2';
      const jsonData = [{
        id: 'hash1',
        alpha: 0.123,
        delta: 0.654321,
      }, {
        id: 'hash2',
        alpha: -0.321,
        delta: 0.98765432166556,
      }];
      const expectedResult = [{
        id: 'recPix1',
        alpha: 0.123,
        delta: 0.654321,
      }, {
        id: 'recPix2',
        alpha: -0.321,
        delta: 0.98765432166556,
      }];

      const result = await matchData(csvData, jsonData);

      expect(result).to.deep.equal(expectedResult);
    });

    it('should ignore entries with not match',  async function() {
      const csvData = 'ChallengeIdHash,challengeId\nhash1,recPix1\nhash2,recPix2';
      const jsonData = [{
        id: 'hash1',
        alpha: 0.123,
        delta: 0.654321,
      }];
      const expectedResult = [{
        id: 'recPix1',
        alpha: 0.123,
        delta: 0.654321,
      }];

      const result = await matchData(csvData, jsonData);

      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#findAirtableIds', function() {
    it('should request airtable with the persistent ids', async function() {
      const data = [{
        id: 'recPix1',
        alpha: 0.123,
        delta: 0.654321,
      }, {
        id: 'recPix2',
        alpha: -0.321,
        delta: 0.98765432166556,
      }];

      const airtableData = [
        new AirtableRecord('Challenge', 'recAirtableId1', {
          fields: {
            'id persistant': 'recPix1'
          },
        }),
        new AirtableRecord('Challenge', 'recAirtableId2', {
          fields: {
            'id persistant': 'recPix2'
          },
        })
      ];

      const base = {
        select: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue(airtableData)
        }),
      };

      const expectedResult = [{
        id: 'recAirtableId1',
        alpha: 0.123,
        delta: 0.654321,
      }, {
        id: 'recAirtableId2',
        alpha: -0.321,
        delta: 0.98765432166556,
      }];

      const result = await findAirtableIds(base, data);

      expect(base.select).toHaveBeenCalledWith({
        fields: ['Record ID', 'id persistant'],
        filterByFormula: 'OR(\'recPix1\' = {id persistant},\'recPix2\' = {id persistant})',
      });
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#updateRecords', function() {
    it('updates alpha and delta in challenges records', async function() {
      const data = [{
        id: 'recAirtableId1',
        alpha: 0.123,
        delta: 0.654321,
      }, {
        id: 'recAirtableId2',
        alpha: -0.321,
        delta: 0.98765432166556,
      }];
      const base = {
        update: vi.fn().mockImplementation((_, cb) => {
          cb();
        }),
      };
      await updateRecords(base, data);
      expect(base.update).toHaveBeenCalledWith(
        [
          {
            id: 'recAirtableId1',
            fields: {
              'Difficulté calculée': '0.654321',
              'Discrimination calculée': '0.123'
            }
          },
          {
            id: 'recAirtableId2',
            fields: {
              'Difficulté calculée': '0.98765432166556',
              'Discrimination calculée': '-0.321'
            }
          }
        ],
        expect.any(Function),
      );
    });

    it('should batch updates with up to 10 records at a time', async function() {
      const data = _.times(11).map((index) => {
        return {
          id: index,
          alpha: 1,
          delta: 2
        };
      });
      const base = {
        update: vi.fn().mockImplementation((_, cb) => {
          cb();
        }),
      };
      await updateRecords(base, data);
      expect(base.update).toHaveBeenCalledTimes(2);
    });
  });
});

