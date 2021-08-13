const chai = require('chai');
const { shouldBeMigrated, cloneFile, updateRecord } = require('./index.js');
const sinon = require('sinon');
const AirtableRecord = require('airtable').Record;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;
const nock = require('nock');

describe('Migrate attachments in subfolder', function() {

  describe('#shouldBeMigrated', function() {
    it('returns false if the url ends with the filename', function() {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/1234567/toto.ods',
          filename: 'toto.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.false;
    });

    it('returns false if the url ends with the encoded filename', function() {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/1234567/toto%20filename.ods',
          filename: 'toto filename.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.false;
    });

    it('returns true if the url does not end with the filename', function() {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/1234567.ods',
          filename: 'toto.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.true;
    });

    it('returns true if the last segment of url is not the filename', function() {
      const record = new AirtableRecord('Attachment', '1', {
        fields: {
          url: 'https://dl.example.net/rec_1234567_toto.ods',
          filename: 'toto.ods',
        },
      });
      expect(shouldBeMigrated(record)).to.be.true;
    });
  });

  describe('#cloneFile', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock.disableNetConnect();
    });

    it('clone the file to a subdir', async function() {
      const clock = { now: () => '123456' };

      process.env.BUCKET_NAME = 'bucket name';

      const cloneFileCall = nock('https://dl.pix.fr')
        .matchHeader('X-Auth-Token', 'TOKEN')
        .matchHeader('X-Copy-From', 'bucket name/123456.ods')
        .put('/randomstring123456/toto.ods')
        .reply(200);

      const newUrl = await cloneFile('TOKEN', 'https://dl.pix.fr/123456.ods', 'randomstring', 'toto.ods', clock);

      cloneFileCall.done();
      expect(newUrl).to.equal('https://dl.pix.fr/randomstring123456/toto.ods');
    });

    it('encode the filename when cloing', async function() {
      const clock = { now: () => '123456' };

      process.env.BUCKET_NAME = 'bucket name';

      const cloneFileCall = nock('https://dl.pix.fr')
        .matchHeader('X-Auth-Token', 'TOKEN')
        .matchHeader('X-Copy-From', 'bucket name/123456.ods')
        .put('/randomstring123456/toto%20filename.ods')
        .reply(200);

      const newUrl = await cloneFile('TOKEN', 'https://dl.pix.fr/123456.ods', 'randomstring', 'toto filename.ods', clock);

      cloneFileCall.done();
      expect(newUrl).to.equal('https://dl.pix.fr/randomstring123456/toto%20filename.ods');
    });
  });

  describe('#updateRecord', function() {
    it('updates url in attachment record', async function() {
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
