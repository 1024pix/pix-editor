const chai = require('chai');
const { shouldBeMigrated } = require('./index.js');
const sinon = require('sinon');
const AirtableRecord = require('airtable').Record;
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const expect = chai.expect;

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

});
