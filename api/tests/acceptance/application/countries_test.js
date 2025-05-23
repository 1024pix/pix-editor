import { beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../server.js';
import { databaseBuilder, generateAuthorizationHeader } from '../../test-helper.js';

describe('Acceptance | API | country | GET /api/countries', function() {
  let editorUser;
  beforeEach(async function() {
    editorUser = databaseBuilder.factory.buildEditorUser();
    await databaseBuilder.commit();
  });

  it('Should return an object of serialized countries', async function() {
    // given / when
    const server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/api/countries',
      headers: generateAuthorizationHeader(editorUser),
    });

    //then
    expect(response.statusCode).toBe(200);
    console.log(response.result.data.length);
    expect(response.result.data.length).to.equal(261);
  });

});
