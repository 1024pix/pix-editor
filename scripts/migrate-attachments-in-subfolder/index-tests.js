const chai = require('chai');
const { shouldBeMigrated, cloneFile, updateRecord } = require('./index.js');
const sinon = require('sinon');
const AirtableRecord = require('airtable').Record;
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const expect = chai.expect;
const nock = require('nock');

describe('Migrate attachments in subfolder', () => {

  describe('#shouldBeMigrated', () => {
    it('returns false if the url ends with the filename', () => {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/1234567/toto.ods',
          filename: 'toto.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.false;
    });

    it('returns true if the url does not end with the filename', () => {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/1234567.ods',
          filename: 'toto.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.true;
    });

    it('returns true if the last segment of url is not the filename', () => {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/rec_1234567_toto.ods',
          filename: 'toto.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.true;
    });
  });

  describe('#cloneFile', () => {
    beforeEach(() => {
      nock.cleanAll();
      nock.disableNetConnect();
    });

    it('clone the file to a subdir', async () => {
      const clock = { now: () => '123456' };

      process.env.TOKEN_URL = 'https://auth.cloud.ovh.net/v3/auth/tokens';
      process.env.BUCKET_USER = 'user';
      process.env.BUCKET_PASSWORD = 'password';
      process.env.BUCKET_NAME = 'bucket name';
      process.env.STORAGE_TENANT = 'tenant';

      const cloneFileCall = nock('https://dl.pix.fr')
            .matchHeader('X-Auth-Token', 'TOKEN')
            .matchHeader('X-Copy-From', 'bucket name/123456.ods')
            .put('/123456/toto.ods')
            .reply(200);

      const getTokenApiCall = nock('https://auth.cloud.ovh.net/v3')
            .post('/auth/tokens', {
              'auth': {
                'identity': {
                  'methods': ['password'],
                  'password': {
                    'user': {
                      'name': 'user',
                      'domain': { 'id': 'default' },
                      'password':'password'
                    }
                  }
                },
                'scope': {
                  'project': {
                    'name': 'tenant',
                    'domain': { 'id': 'default' }
                  }
                }
              }
            })
            .reply(200, {}, {
              'x-subject-token': 'TOKEN'
            });

      const newUrl = await cloneFile('https://dl.pix.fr/123456.ods', 'toto.ods', clock);

      getTokenApiCall.done();
      cloneFileCall.done();
      expect(newUrl).to.equal('https://dl.pix.fr/123456/toto.ods');
    });
  });

    describe('#updateRecord', () => {
      it('updates url in attachment record', async () => {
        const base = {
          update: sinon.stub().yields(),
        };
        await updateRecord(base, 'rec123', 'https://dl.pix.fr/6789/toto.ods');
        expect(base.update).to.be.calledWith([
          {
            id: 'rec123',
            fields: {
              url: 'https://dl.pix.fr/6789/toto.ods'
            }
          }
        ]);
      });
    });
});
