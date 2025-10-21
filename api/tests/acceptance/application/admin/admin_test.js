import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | admin', () => {
  describe('GET api/admin/schemas', () => {
    let user;

    beforeEach(async function() {
      user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
    });

    it('should return the list of schemas', async () => {
      // given
      const server = await createServer();
      const getConfigOptions = {
        method: 'GET',
        url: '/api/admin/schemas',
        headers: generateAuthorizationHeader(user)
      };

      // when
      const response = await server.inject(getConfigOptions);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            attributes: {
              'label': 'Utilisateurs',
              'entity-name': 'user',
              'editable': true,
              'deletable': true,
              'creatable': true,
            },
            id: 'user-schema-id',
            type: 'admin-schemas'
          }
        ]
      });
    });
  });

});
