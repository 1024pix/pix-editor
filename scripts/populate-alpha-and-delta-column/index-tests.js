import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import _ from 'lodash';
import { matchData, findAirtableIds, updateRecords } from './index.js';
import airtable from 'airtable';
import { parseData } from '../populate-alpha-and-delta-column-with-csv/index.js';
const { Record: AirtableRecord } = airtable;

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
        select: sinon.stub().returns({
          all: sinon.stub().resolves(airtableData)
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

      expect(base.select).to.have.been.calledWith({
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
        update: sinon.stub().yields(),
      };
      await updateRecords(base, data);
      expect(base.update).to.be.calledWith([
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
      ]);
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
        update: sinon.stub().yields(),
      };
      await updateRecords(base, data);
      expect(base.update).to.have.been.calledTwice;
    });
  });
});

