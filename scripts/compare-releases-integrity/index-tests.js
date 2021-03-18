const chai = require('chai');
const { replaceAttachmentsUrlByChecksum, compareReleases } = require('.');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nock = require('nock');
chai.use(sinonChai);
const expect = chai.expect;

// 1. Récupère la release en prod
// 2. Récupère la release sur la RA
// 3. Remplace les url des attachments par leur checksum
// 4. Compare des 2 releases

describe('#replaceAttachmentsUrlByChecksum', () => {
  it('returns challenge with attachments url replaced by checksum', async () => {
    const initialChallenge = {
      some: 'property',
      illustrationUrl: 'illustration-url',
      attachments: [
        'attachments-url-1',
        'attachments-url-2',
      ],
    };

    const remoteChecksumComputerStub = sinon.stub();
    remoteChecksumComputerStub.resolves('sha1');

    const challenge = await replaceAttachmentsUrlByChecksum(initialChallenge, remoteChecksumComputerStub);

    expect(challenge).to.deep.equal({
      some: 'property',
      illustrationUrl: 'sha1',
      attachments: ['sha1', 'sha1'],
    });
    expect(remoteChecksumComputerStub.callCount).to.equal(3);
    expect(remoteChecksumComputerStub).to.be.calledWith('illustration-url');
    expect(remoteChecksumComputerStub).to.be.calledWith('attachments-url-1');
    expect(remoteChecksumComputerStub).to.be.calledWith('attachments-url-2');
  });

  it('should works when there is no attachments', async () => {
    const initialChallenge = {
      some: 'property',
      illustrationUrl: 'illustration-url',
    };

    const remoteChecksumComputerStub = sinon.stub();
    remoteChecksumComputerStub.resolves('sha1');

    const challenge = await replaceAttachmentsUrlByChecksum(initialChallenge, remoteChecksumComputerStub);

    expect(challenge).to.deep.equal({
      some: 'property',
      illustrationUrl: 'sha1',
    });
    expect(remoteChecksumComputerStub.callCount).to.equal(1);
    expect(remoteChecksumComputerStub).to.be.calledWith('illustration-url');
  });

  it('should works when there is no illustrations', async () => {
    const initialChallenge = {
      some: 'property',
      attachments: [
        'attachments-url-1',
        'attachments-url-2',
      ],
    };

    const remoteChecksumComputerStub = sinon.stub();
    remoteChecksumComputerStub.resolves('sha1');

    const challenge = await replaceAttachmentsUrlByChecksum(initialChallenge, remoteChecksumComputerStub);

    expect(challenge).to.deep.equal({
      some: 'property',
      attachments: ['sha1', 'sha1'],
    });
    expect(remoteChecksumComputerStub.callCount).to.equal(2);
    expect(remoteChecksumComputerStub).to.be.calledWith('attachments-url-1');
    expect(remoteChecksumComputerStub).to.be.calledWith('attachments-url-2');
  });
});

describe('#compareReleases', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  it('should return an empty table when there is no differences', async () => {
    const remoteChecksumComputer = sinon.stub();
    const productionRelease = {
      content: {
        challenges: [{ id: 1 }]
      }
    };
    const url1Scope = nock('http://url1.com')
      .matchHeader('Authorization', 'Bearer myToken1')
      .get('/api/releases/latest')
      .reply(200, productionRelease);

    const newRelease = {
      content: {
        challenges: [{ id: 1 }]
      }
    };
    const url2Scope = nock('http://url2.com')
      .matchHeader('Authorization', 'Bearer myToken2')
      .get('/api/releases/latest')
      .reply(200, newRelease);

    const differences = await compareReleases({ url: 'http://url1.com', token: 'myToken1' }, { url: 'http://url2.com', token: 'myToken2' }, remoteChecksumComputer);

    expect(differences).to.deep.equal([]);
    url1Scope.isDone();
    url2Scope.isDone();
  });

  it('should return the differences', async () => {
    const remoteChecksumComputer = sinon.stub()
      .onFirstCall().resolves('sha1')
      .onSecondCall().resolves('sha2');

    const expectedDifference = 'recCorruptedChallenge';

    const productionRelease = {
      content: {
        challenges: [{
          id: 'recCorruptedChallenge',
          illustrationUrl: 'illustration-url',
        }]
      }
    };
    nock('http://url1.com')
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
    nock('http://url2.com')
      .get('/api/releases/latest')
      .reply(200, newRelease);

    const differences = await compareReleases({ url: 'http://url1.com' }, { url: 'http://url2.com' }, remoteChecksumComputer);


    expect(differences).to.deep.equal([expectedDifference]);
  });
});
