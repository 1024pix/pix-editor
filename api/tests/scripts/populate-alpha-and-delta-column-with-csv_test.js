import { describe, expect, it } from 'vitest';

import { parseData } from '../../scripts/populate-alpha-and-delta-column-with-csv.js';

describe('Populate alpha and delta column', function () {
  describe('#parseData', function () {
    it('should return a object table with challenge persistent id, alpha and delta', async function () {
      const csvData =
        'items,difficulties,discriminants\nrec1,0.8423189520825876,1.6760518550872801\nrec2,-0.9423189520825878,2.6760518550872802';

      const expectedResult = [
        {
          id: 'rec1',
          alpha: '1.6760518550872801',
          delta: '0.8423189520825876',
        },
        {
          id: 'rec2',
          alpha: '2.6760518550872802',
          delta: '-0.9423189520825878',
        },
      ];

      const result = await parseData(csvData);

      expect(result).to.deep.equal(expectedResult);
    });
  });
});
