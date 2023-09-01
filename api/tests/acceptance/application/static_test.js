import { expect } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | static', () => {
  it('Return the index.html in case of 404', async () => {
    // Given
    const server = await createServer();
    const request = {
      method: 'GET',
      url: '/toto.html',
    };

    // When
    const response = await server.inject(request);

    // Then
    expect(response.statusCode).to.equal(200);
  });

  it('Returns a 404 on api request', async () => {
    // Given
    const server = await createServer();
    const request = {
      method: 'GET',
      url: '/api/toto.html',
    };

    // When
    const response = await server.inject(request);

    // Then
    expect(response.statusCode).to.equal(404);
  });

  it('Returns a 404 on POST request', async () => {
    // Given
    const server = await createServer();
    const request = {
      method: 'POST',
      url: '/toto.html',
    };

    // When
    const response = await server.inject(request);

    // Then
    expect(response.statusCode).to.equal(404);
  });
});
