import { describe, expect, it } from 'vitest';
import { extractParameters } from '../../../../lib/infrastructure/utils/query-params-utils.js';

describe('Unit | Utils | Query Params Utils', function() {
  describe('#extractParameters', function() {
    it('should extract multiple parameters from request Object', function() {
      // given
      const query = {
        'filter[courseId]': '26',
        'filter[userId]': '1',
        'filter[skillIds][]': '123',
        'filter[tubeIds][]': ['456', '789'],
        'page[number]': '1',
        'page[size]': '200',
        'sort[participationCount]': 'asc',
        include: 'user,organization',
      };

      // when
      const result = extractParameters(query);

      // then
      expect(result).to.deep.equal({
        filter: {
          courseId: '26',
          userId: '1',
          skillIds: ['123'],
          tubeIds: ['456', '789'],
        },
        page: {
          number: 1,
          size: 200,
        },
        sort: {
          participationCount: 'asc',
        },
        include: ['user', 'organization'],
      });
    });

    it('should return an object with empty properties if query does not contain jsonapi params', function() {
      // given
      const query = {
        page: 1,
        pageSize: 10,
      };

      // when
      const result = extractParameters(query);

      // then
      expect(result).to.deep.equal({
        filter: {},
        page: {},
        sort: {},
        include: [],
      });
    });

    it('should support default values for objects', function() {
      // given
      const query = {
        'page[number]': '1',
      };
      const defaultQuery = {
        page: {
          size: 100,
        },
        sort: {
          participationCount: 'asc',
        }
      };

      // when
      const result = extractParameters(query, defaultQuery);

      // then
      expect(result).to.deep.equal({
        filter: {},
        page: {
          number: 1,
          size: 100,
        },
        sort: {
          participationCount: 'asc',
        },
        include: [],
      });
    });
  });
});
