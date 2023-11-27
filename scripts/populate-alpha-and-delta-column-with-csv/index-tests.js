import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import _ from 'lodash';
import { parseData, findAirtableIds, updateRecords, clearDifficultyAndDiscriminant } from './index.js';
import airtable from 'airtable';
const { Record: AirtableRecord } = airtable;

describe('Populate alpha and delta column', function() {
  describe('#parseData', function() {
    it('should return a object table with challenge persistent id, alpha and delta', async function() {
      const csvData = 'items,difficulties,discriminants\nrec1,0.8423189520825876,1.6760518550872801\nrec2,-0.9423189520825878,2.6760518550872802';

      const expectedResult = [{
        id: 'rec1',
        alpha: '1.6760518550872801',
        delta: '0.8423189520825876',
      }, {
        id: 'rec2',
        alpha: '2.6760518550872802',
        delta: '-0.9423189520825878',
      }];

      const result = await parseData(csvData);

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

  describe('#clearDifficultyAndDiscriminant', function() {
    it('deletes value of difficulty and discriminant in challenges records', async function() {
      const recordsCount = 100;
      const records = _.range(0, recordsCount)
        .map((recordIndex) => ({
          id: `recAirtableId${recordIndex}`,
          fields: {
            'Difficulté calculée': '0.98765432166556',
            'Discrimination calculée': '-0.321'
          }
        }));

      const all = sinon.stub().resolves(records);
      const base = {
        update: sinon.stub(),
        select: () => ({
          all
        })
      };

      const updatedRecords = [];

      base.update.callsFake((records) => {
        expect(records.length).to.be.lessThanOrEqual(10, 'Update should be called with at least 10 records');
        updatedRecords.push(...records);
      });
      await clearDifficultyAndDiscriminant(base);

      expect(updatedRecords.length).to.equal(recordsCount);
      updatedRecords.forEach((record) => {
        expect(record.fields['Difficulté calculée']).to.be.null;
        expect(record.fields['Discrimination calculée']).to.be.null;
      });
    });
  });
});

