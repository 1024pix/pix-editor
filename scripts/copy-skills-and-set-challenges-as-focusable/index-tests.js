const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;
const nock = require('nock');
const AirtableRecord = require('airtable').Record;
const { USEFUL_SKILL_FIELDS, USEFUL_CHALLENGE_FIELDS } = require('./airtable-fields');
const {
  findSkill,
  duplicateSkill,
  prepareNewChallenge,
  cloneAttachmentsFromAChallenge,
  findChallengesFromASkill,
  archiveChallenges,
  archiveSkill,
  activateSkill,
} = require('.');

describe('Copy skills and set challenges as focusable', function() {
  describe('#findSkill', function() {
    it('should call airtable to find a skill', async function() {
      const persistentId = 1;
      const airtableData = [
        new AirtableRecord('Skill', 'recAirtableId1', {
          fields: {
            'id persistant': '1',
            'Version': 2,
            'Status': 'actif',
            'Description': 'Coucou'
          },
        }),
      ];
      const base = {
        select: sinon.stub().returns({
          all: sinon.stub().resolves(airtableData)
        }),
      };
      const skill = await findSkill(base, persistentId);

      expect(base.select).to.have.been.calledWith({
        fields: USEFUL_SKILL_FIELDS,
        filterByFormula : '{id persistant} = \'1\'',
        maxRecords: 1
      });
      expect(skill).to.deep.equal(airtableData[0]);
    });
  });

  describe('#duplicateSkill', function() {
    it('should duplicate skill', async function() {
      const skill  = new AirtableRecord('Skill', 'recAirtableId1', {
        fields: {
          'id persistant': '1',
          'Version': 2,
          'Status': 'actif',
          'Description': 'Coucou'
        },
      });
      const createdAirtableData = [
        new AirtableRecord('Skill', 'recNewSkillId'),
      ];
      const base = {
        create: sinon.stub().resolves(createdAirtableData),
      };
      const idGenerator = (prefix) => `${prefix}IdPersistantRandom`;

      const createdSkill = await duplicateSkill(base, idGenerator, skill);

      expect(createdSkill).to.deep.equal(createdAirtableData[0]);
      expect(base.create).to.have.been.calledWith([{
        fields: {
          'id persistant': 'skillIdPersistantRandom',
          'Version': 3,
          'Status': 'en construction',
          'Description': 'Coucou',
        }
      }]);
    });
  });

  describe('#findChallengesFromASkill', function() {
    it('should find challenges from a skill when status is validated, validated without tests and pre-validated', async function() {
      const skillPersistentId = 1;
      const airtableData = [
        new AirtableRecord('Challenges', 'recAirtableId1', {
          fields: {
            'id persistant': '1',
            'Statut': 'validé',
            'Consigne': 'Coucou',
            'Focalisée': false,
          },
        }),
      ];
      const base = {
        select: sinon.stub().returns({
          all: sinon.stub().resolves(airtableData)
        }),
      };

      await findChallengesFromASkill(base, skillPersistentId);

      expect(base.select).to.have.been.calledWith({
        fields: USEFUL_CHALLENGE_FIELDS,
        filterByFormula : 'AND({Acquix (id persistant)} = \'1\', ' +
          'OR({Statut} = \'validé\', {Statut} = \'validé sans test\', {Statut} = \'pré-validé\'))',
      });
    });
  });

  describe('#prepareNewChallenge', function() {
    it('should create the updated airtable serialization', function() {
      const destinationSkillId = 2;
      const challenge =  new AirtableRecord('Challenges', 'recAirtableId1', {
        fields: {
          'id persistant': '1',
          'Statut': 'validé',
          'Consigne': 'Coucou',
          'Focalisée': false,
        },
      });
      const newAttachmentsId = [1, 2];
      const idGenerator = (prefix) => `${prefix}IdPersistantRandom`;

      const newChallenge = prepareNewChallenge(challenge, destinationSkillId, newAttachmentsId, idGenerator);

      expect(newChallenge).to.deep.equal({
        fields: {
          'id persistant': 'challengeIdPersistantRandom',
          'Statut': 'validé',
          'Consigne': 'Coucou',
          'Acquix': [destinationSkillId],
          'Focalisée': true,
          'files': [1, 2],
        },
      });
    });
  });

  describe('#cloneAttachmentsFromAChallenge', function() {
    beforeEach(function() {
      nock.cleanAll();
      nock.disableNetConnect();
      process.env.BUCKET_NAME = 'bucket name';
    });

    it('should retrieve challenge attachments from a challenge and clone them', async function() {
      const challengePersistantId = 1;
      const airtableAttachments = [
        new AirtableRecord('Attachments', 'recAttachmentAirtableId1', {
          fields: {
            filename: 'attachment.pdf',
            url: 'https://example.net/attachment.pdf',
          },
        }),
        new AirtableRecord('Attachments', 'recAttachmentAirtableId2', {
          fields: {
            filename: 'attachment2.pdf',
            url: 'https://example.net/attachment2.pdf',
          },
        }),
      ];
      const newAirtableAttachments = [
        new AirtableRecord('Attachments', 'recNewAttachmentAirtableId1'),
        new AirtableRecord('Attachments', 'recNewAttachmentAirtableId2'),
      ];
      const base = {
        select: sinon.stub().returns({
          all: sinon.stub().resolves(airtableAttachments)
        }),
        create: sinon.stub().resolves(newAirtableAttachments),
      };

      const token = 'TOKEN';
      const cloneFileCall = nock('https://example.net')
        .matchHeader('X-Auth-Token', token)
        .matchHeader('X-Copy-From', 'bucket name/attachment.pdf')
        .put('/recAttachmentAirtableId1123456/attachment.pdf')
        .reply(200);
      const cloneFileCall2 = nock('https://example.net')
        .matchHeader('X-Auth-Token', token)
        .matchHeader('X-Copy-From', 'bucket name/attachment2.pdf')
        .put('/recAttachmentAirtableId2123456/attachment2.pdf')
        .reply(200);

      const result = await cloneAttachmentsFromAChallenge(base, token, challengePersistantId, { now() { return '123456'; } });

      expect(base.select).to.have.been.calledWith({
        fields: [
          'filename',
          'size',
          'alt',
          'url',
          'mimeType',
          'type',
        ],
        filterByFormula : '{challengeId persistant} = \'1\''
      });

      cloneFileCall.done();
      cloneFileCall2.done();

      expect(base.create).to.have.been.calledWith([
        {
          fields: {
            filename: 'attachment.pdf',
            url: 'https://example.net/recAttachmentAirtableId1123456/attachment.pdf',
          },
        },
        {
          fields: {
            filename: 'attachment2.pdf',
            url: 'https://example.net/recAttachmentAirtableId2123456/attachment2.pdf',
          },
        },
      ]);
      expect(result).to.deep.equal(['recNewAttachmentAirtableId1', 'recNewAttachmentAirtableId2']);
    });
  });

  describe('#archiveChallenges', function() {

    it('should archive challenges', async function() {
      const challenges = [
        new AirtableRecord('Challenges', 'recAirtableId1', {
          fields: {
            'id persistant': '1',
            'Statut': 'validé',
            'Consigne': 'Coucou',
            'Focalisée': false,
          },
        }),
        new AirtableRecord('Challenges', 'recAirtableId2', {
          fields: {
            'id persistant': '2',
            'Statut': 'validé sans test',
            'Consigne': 'Coucou',
            'Focalisée': false,
          },
        }),
      ];
      const base = {
        update: sinon.stub(),
      };

      await archiveChallenges(base, challenges);

      expect(base.update).to.have.been.calledWith([
        {
          id: 'recAirtableId1',
          fields: {
            'Statut': 'archivé'
          },
        },
        {
          id: 'recAirtableId2',
          fields: {
            'Statut': 'archivé',
          },
        },
      ]);
    });
  });

  describe('#archiveSkill', function() {

    it('should archive skill', async function() {
      const skill = new AirtableRecord('Skills', 'recAirtableId1', {
        fields: {
          'id persistant': '1',
          'Status': 'validé',
          'Description': 'Coucou',
        },
      });
      const base = {
        update: sinon.stub(),
      };

      await archiveSkill(base, skill);

      expect(base.update).to.have.been.calledWith([
        {
          id: 'recAirtableId1',
          fields: {
            'Status': 'archivé'
          },
        },
      ]);
    });
  });

  describe('#activateSkill', function() {

    it('should activate skill', async function() {
      const skill = new AirtableRecord('Skills', 'recAirtableId1', {
        fields: {
          'id persistant': '1',
          'Status': 'en construction',
          'Description': 'Coucou',
        },
      });
      const base = {
        update: sinon.stub(),
      };

      await activateSkill(base, skill);

      expect(base.update).to.have.been.calledWith([
        {
          id: 'recAirtableId1',
          fields: {
            'Status': 'actif'
          },
        },
      ]);
    });
  });
});
