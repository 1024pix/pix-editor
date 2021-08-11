const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const expect = chai.expect;
const nock = require('nock');
const AirtableRecord = require('airtable').Record;
const { findAndDuplicateSkill, duplicateAssociatedSkillChallenges, findChallengesFromASkill, Add findAndDuplicateAssociatedSkillChallenges } = require('.');

describe('Copy skills and set challenges as focusable', () => {
  describe('#findAndDuplicateSkill', () => {
    it('should call airtable to find skill and duplicate it', async () => {
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
      const createdAirtableData = [
        new AirtableRecord('Skill', 'recNewSkillId'),
      ];
      const base = {
        select: sinon.stub().returns({
          all: sinon.stub().resolves(airtableData)
        }),
        create: sinon.stub().resolves(createdAirtableData),
      };
      const idGenerator = (prefix) => `${prefix}IdPersistantRandom`;

      const createdSkillId = await findAndDuplicateSkill(base, idGenerator, persistentId);

      expect(createdSkillId).to.equal('recNewSkillId');
      expect(base.select).to.have.been.calledWith({
        fields: ['id persistant', 'Indice', 'Indice fr-fr', 'Indice en-us', 'Statut de l\'indice', 'Compétence', 'Comprendre', 'En savoir plus', 'Tags', 'Description', 'Statut de la description', 'Level', 'Tube', 'Status', 'Internationalisation', 'Version'],
        filterByFormula : "{id persistant} = '1'",
        maxRecords: 1
      });

      expect(base.create).to.have.been.calledWith([{
        fields: {
          'id persistant': 'skillIdPersistantRandom',
          'Version': 3,
          'Status': 'en construction',
          'Description': 'Coucou',
        }
      }])
    });
  });

  describe('#findChallengesFromASkill', () => {
    it('should find challenges from a skill', async () => {
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

      await findChallengesFromASkill(base, skillPersistentId)

      expect(base.select).to.have.been.calledWith({
        fields: [
          'id persistant',
          'Timer',
          'Consigne',
          'Propositions',
          'Type d\'épreuve',
          'Bonnes réponses',
          'Bonnes réponses à afficher',
          'T1 - Espaces, casse & accents',
          'T2 - Ponctuation',
          'T3 - Distance d\'édition',
          'Scoring',
          'Statut',
          'Embed URL',
          'Embed title',
          'Embed height',
          'Format',
          'files',
          'Réponse automatique',
          'Langues',
          'Consigne alternative',
          'Focalisée',
          'Acquix',
          'Généalogie',
          'Type péda',
          'Auteur',
          'Déclinable',
          'Version prototype',
          'Version déclinaison',
          'Non voyant',
          'Daltonien',
          'Spoil',
          'Responsive',
          'Géographie',
        ],
        filterByFormula : "{Acquix (id persistant)} = '1'",
      });
    });
  });

  describe('#duplicateAssociatedSkillChallenges', () => {
    it('should call airtable to duplicate associated challenges of a skill', async () => {
      const destinationSkillId = 2;
      const challenges = [
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
        create: sinon.stub().resolves(),
      };
      const idGenerator = (prefix) => `${prefix}IdPersistantRandom`;

      await duplicateAssociatedSkillChallenges(base, idGenerator, challenges, destinationSkillId);

      expect(base.create).to.have.been.calledWith([{
        fields: {
          'id persistant': 'challengeIdPersistantRandom',
          'Statut': 'validé',
          'Consigne': 'Coucou',
          'Acquix': [destinationSkillId],
          'Focalisée': true,
        }
      }]);
    });
  });

  describe('#cloneAttachmentsFromAChallenge', () => {

    beforeEach(() => {
      nock.cleanAll();
      nock.disableNetConnect();
      process.env.BUCKET_NAME = 'bucket name';
    });

    it('should retrieve challenge attachments from a challenge', async () => {
      const challengePersistantId = 1;
      const airtableData = [
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
      const base = {
        select: sinon.stub().returns({
          all: sinon.stub().resolves(airtableData)
        }),
        create: sinon.stub().resolves(),
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

      await cloneAttachmentsFromAChallenge(base, token, challengePersistantId, { now() { return '123456'; } });

      expect(base.select).to.have.been.calledWith({
        fields: [
          'filename',
          'size',
          'alt',
          'url',
          'mimeType',
          'type',
        ],
        filterByFormula : "{challengeId persistant} = '1'"
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
    });
  });
});
