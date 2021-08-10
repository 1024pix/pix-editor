const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const expect = chai.expect;
const AirtableRecord = require('airtable').Record;
const { findAndDuplicateSkill } = require('.');

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
});

