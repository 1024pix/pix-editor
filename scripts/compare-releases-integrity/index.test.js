import { beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';

import { replaceAttachmentsUrlByChecksum, compareReleases, remoteChecksumComputer } from './index.js';

describe('Scripts | Compare Release Integrity', function() {
  describe('#replaceAttachmentsUrlByChecksum', function() {
    it('returns challenge with attachments url replaced by checksum', async function() {
      const initialChallenge = {
        some: 'property',
        illustrationUrl: 'illustration-url',
        attachments: [
          'attachments-url-1',
          'attachments-url-2',
        ],
      };

      const remoteChecksumComputerStub = vi.fn();
      remoteChecksumComputerStub.mockResolvedValue('sha1');

      const challenge = await replaceAttachmentsUrlByChecksum(initialChallenge, remoteChecksumComputerStub);

      expect(challenge).to.deep.equal({
        some: 'property',
        illustrationUrl: 'sha1',
        attachments: ['sha1', 'sha1'],
      });
      expect(remoteChecksumComputerStub).toHaveBeenCalledTimes(3);
      expect(remoteChecksumComputerStub).toHaveBeenCalledWith('illustration-url');
      expect(remoteChecksumComputerStub).toHaveBeenCalledWith('attachments-url-1');
      expect(remoteChecksumComputerStub).toHaveBeenCalledWith('attachments-url-2');
    });

    it('should works when there is no attachments', async function() {
      const initialChallenge = {
        some: 'property',
        illustrationUrl: 'illustration-url',
      };

      const remoteChecksumComputerStub = vi.fn();
      remoteChecksumComputerStub.mockResolvedValue('sha1');

      const challenge = await replaceAttachmentsUrlByChecksum(initialChallenge, remoteChecksumComputerStub);

      expect(challenge).to.deep.equal({
        some: 'property',
        illustrationUrl: 'sha1',
      });
      expect(remoteChecksumComputerStub).toHaveBeenCalledTimes(1);
      expect(remoteChecksumComputerStub).toHaveBeenCalledWith('illustration-url');
    });

    it('should works when there is no illustrations', async function() {
      const initialChallenge = {
        some: 'property',
        attachments: [
          'attachments-url-1',
          'attachments-url-2',
        ],
      };

      const remoteChecksumComputerStub = vi.fn();
      remoteChecksumComputerStub.mockResolvedValue('sha1');

      const challenge = await replaceAttachmentsUrlByChecksum(initialChallenge, remoteChecksumComputerStub);

      expect(challenge).to.deep.equal({
        some: 'property',
        attachments: ['sha1', 'sha1'],
      });
      expect(remoteChecksumComputerStub).toHaveBeenCalledTimes(2);
      expect(remoteChecksumComputerStub).toHaveBeenCalledWith('attachments-url-1');
      expect(remoteChecksumComputerStub).toHaveBeenCalledWith('attachments-url-2');
    });
  });

  describe('#compareReleases', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock.disableNetConnect();
    });

    it('should return an empty table when there is no differences', async function() {
      const remoteChecksumComputer = vi.fn();
      const productionRelease = {
        content: {
          challenges: [{ id: 1 }]
        }
      };
      const url1Scope = nock('http://example.org')
        .matchHeader('Authorization', 'Bearer myToken1')
        .get('/api/releases/latest')
        .reply(200, productionRelease);

      const newRelease = {
        content: {
          challenges: [{ id: 1 }]
        }
      };
      const url2Scope = nock('http://example.com')
        .matchHeader('Authorization', 'Bearer myToken2')
        .get('/api/releases/latest')
        .reply(200, newRelease);

      const differences = await compareReleases(
        { url: 'http://example.org/api/releases/latest', token: 'myToken1' },
        { url: 'http://example.com/api/releases/latest', token: 'myToken2' },
        remoteChecksumComputer
      );

      expect(differences).to.deep.equal([]);
      expect(url1Scope.isDone()).toBe(true);
      expect(url2Scope.isDone()).toBe(true);
    });

    it('should return an empty table when there is no differences when challenges are not ordered', async function() {
      const remoteChecksumComputer = vi.fn();
      const productionRelease = {
        content: {
          challenges: [
            { id: 1 },
            { id: 2 },
          ],
        },
      };
      const url1Scope = nock('http://example.org')
        .matchHeader('Authorization', 'Bearer myToken1')
        .get('/api/releases/latest')
        .reply(200, productionRelease);

      const newRelease = {
        content: {
          challenges: [
            { id: 2 },
            { id: 1 },
          ],
        },
      };
      const url2Scope = nock('http://example.com')
        .matchHeader('Authorization', 'Bearer myToken2')
        .get('/api/releases/latest')
        .reply(200, newRelease);

      const differences = await compareReleases(
        { url: 'http://example.org/api/releases/latest', token: 'myToken1' },
        { url: 'http://example.com/api/releases/latest', token: 'myToken2' },
        remoteChecksumComputer
      );

      expect(differences).to.deep.equal([]);
      expect(url1Scope.isDone()).toBe(true);
      expect(url2Scope.isDone()).toBe(true);
    });

    it('should ignore text with space before new line', async function() {
      const remoteChecksumComputer = vi.fn();
      const productionRelease = {
        content: {
          challenges: [{ id: 1, illustrationAlt: 'alternative text . \ntest' }]
        }
      };
      const url1Scope = nock('http://example.org')
        .matchHeader('Authorization', 'Bearer myToken1')
        .get('/api/releases/latest')
        .reply(200, productionRelease);

      const newRelease = {
        content: {
          challenges: [{ id: 1, illustrationAlt: 'alternative text .\ntest' }]
        }
      };
      const url2Scope = nock('http://example.com')
        .matchHeader('Authorization', 'Bearer myToken2')
        .get('/api/releases/latest')
        .reply(200, newRelease);

      const differences = await compareReleases(
        { url: 'http://example.org/api/releases/latest', token: 'myToken1' },
        { url: 'http://example.com/api/releases/latest', token: 'myToken2' },
        remoteChecksumComputer
      );

      expect(differences).to.deep.equal([]);
      url1Scope.done();
      url2Scope.done();
    });

    it('should return the differences', async function() {
      const remoteChecksumComputer = vi.fn()
        .mockResolvedValueOnce('sha1')
        .mockResolvedValueOnce('sha2');

      const expectedDifference = 'recCorruptedChallenge';

      const productionRelease = {
        content: {
          challenges: [{
            id: 'recCorruptedChallenge',
            illustrationUrl: 'illustration-url',
          }]
        }
      };
      nock('http://example.org')
        .get('/api/releases/latest')
        .reply(200, productionRelease);

      const newRelease = {
        content: {
          challenges: [{
            id: 'recCorruptedChallenge',
            illustrationUrl: 'illustration-corrupted-url',
          }]
        }
      };
      nock('http://example.com')
        .get('/api/releases/latest')
        .reply(200, newRelease);

      const differences = await compareReleases(
        { url: 'http://example.org/api/releases/latest', token: 'myToken1' },
        { url: 'http://example.com/api/releases/latest', token: 'myToken2' },
        remoteChecksumComputer
      );

      expect(differences).to.deep.equal([expectedDifference]);
    });

    it('should return the differences when the number of challenges differ', async function() {
      const remoteChecksumComputer = vi.fn()
        .mockResolvedValueOnce('sha1')
        .mockResolvedValueOnce('sha2');

      const expectedDifference = ['2', '4', '5'];

      const productionRelease = {
        content: {
          challenges: [{
            id: '1',
          },{
            id: '2',
          }, {
            id: '3',
          }]
        }
      };
      nock('http://example.org')
        .get('/api/releases/latest')
        .reply(200, productionRelease);

      const newRelease = {
        content: {
          challenges: [{
            id: '1',
          }, {
            id: '5',
          }, {
            id: '3',
          }, {
            id: '4',
          }]
        }
      };
      nock('http://example.com')
        .get('/api/releases/latest')
        .reply(200, newRelease);

      const differences = await compareReleases(
        { url: 'http://example.org/api/releases/latest', token: 'myToken1' },
        { url: 'http://example.com/api/releases/latest', token: 'myToken2' },
        remoteChecksumComputer
      );

      expect(differences).to.deep.equal(expectedDifference);
    });
  });

  describe('#remoteChecksumComputer', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock.disableNetConnect();
    });

    it('compute the hash of the remote file', async function() {
      const requestCall = nock('http://example.net')
        .get('/file.jpg')
        .reply(200, 'test');
      const hash = await remoteChecksumComputer('http://example.net/file.jpg');

      expect(hash).to.equal('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
      expect(requestCall.isDone()).toBe(true);
    });

    it('returns an error when the server returns an error', async function() {
      const requestCall = nock('http://example.net')
        .get('/file.jpg')
        .reply(400, '');
      const hash = await remoteChecksumComputer('http://example.net/file.jpg');

      expect(hash).to.equal('http://example.net/file.jpg');
      expect(requestCall.isDone()).toBe(true);
    });
  });
});
