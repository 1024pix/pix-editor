import { beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../test-helper.js';
import nock from 'nock';
import { Challenge } from '../../lib/domain/models/index.js';
import { challengeDatasource } from '../../lib/infrastructure/datasources/airtable/index.js';
import {
  ScanChallengesForDiscrepanciesBetweenPrototypesAndAlternatives
} from '../../scripts/scan-challenges-for-discrepancies-between-prototypes-and-alternatives.js';

describe('Script | scan-challenges-for-discrepancies-between-prototypes-and-alternatives', () => {
  let dataThatShouldBeTheSame, someOtherCommonData, airtableChallengesScope;
  beforeEach(() => {
    dataThatShouldBeTheSame = {
      'accessibility1': Challenge.ACCESSIBILITY1.OK,
      'accessibility2': Challenge.ACCESSIBILITY2.OK,
      'autoReply': true,
      'contextualizedFields': [Challenge.CONTEXTUALIZED_FIELDS.ATTACHMENTS, Challenge.CONTEXTUALIZED_FIELDS.EMBED],
      'deafAndHardOfHearing': true,
      'declinable': Challenge.DECLINABLES.FACILEMENT,
      'focusable': true,
      'hasEmbedInternalValidation': true,
      'isAwarenessChallenge': true,
      'isIncompatibleIpadCertif': true,
      'noValidationNeeded': true,
      'pedagogy': Challenge.PEDAGOGIES.E_PREUVE,
      'requireGafamWebsiteAccess': true,
      'responsive': Challenge.RESPONSIVES.SMARTPHONE,
      'shuffled': true,
      'spoil': Challenge.SPOILS.DIFFICILEMENT_SPOILABLE,
      'timer': 123,
      'toRephrase': true,
      'type': Challenge.TYPES.QROCM,
    };
    someOtherCommonData = {
      instruction: 'A',
      alternativeInstruction: 'A',
      proposals: 'A',
      solution: 'A',
      solutionToDisplay: 'A',
      t1Status: true,
      t2Status: true,
      t3Status: true,
      status: Challenge.STATUSES.VALIDE,
      competenceId: 'A',
      embedUrl: 'A',
      embedTitle: 'A',
      embedHeight: 1,
      format: Challenge.FORMATS.MOTS,
      locales: ['fr'],
      author: ['A'],
      geography: 'FR',
      files: [],
      updatedAt: '2021-10-04',
      createdAt: '1986-07-14',
      validatedAt: '2023-02-02T14:17:30.820Z',
      archivedAt: '2023-03-03T10:47:05.555Z',
      madeObsoleteAt: '2023-04-04T10:47:05.555Z',
      skillId: 'recSkillId',
      alpha: 1,
      delta: 1,
      version: 1,
      locale: 'fr',
      urlsToConsult: ['a'],
    };
    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
    databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
    databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
    databaseBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'PROTO', skillId: 'skill1' }));
    databaseBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'DECLI1_ISO', skillId: 'skill1' }));
    databaseBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'DECLI2', skillId: 'skill1' }));
    databaseBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'DECLI_ORPHAN_VERSION', skillId: 'skill1' }));
    databaseBuilder.factory.buildChallenge(domainBuilder.buildChallengeDatasourceObject({ id: 'DECLI_ORPHAN_SKILL', skillId: 'skill1' }));
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'PROTO',
      challengeId: 'PROTO',
      status: null,
      ...someOtherCommonData,
      ...dataThatShouldBeTheSame,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'DECLI1_ISO',
      challengeId: 'DECLI1_ISO',
      locale: 'en',
      embedUrl: 'B',
      status: null,
      geography: 'EN',
      urlsToConsult: ['B'],
      ...dataThatShouldBeTheSame,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'DECLI2',
      challengeId: 'DECLI2',
      locale: 'fr',
      status: null,
      'hasEmbedInternalValidation': false,
      'isAwarenessChallenge': false,
      'isIncompatibleIpadCertif': false,
      'noValidationNeeded': false,
      'deafAndHardOfHearing': false,
      'requireGafamWebsiteAccess': false,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'DECLI_ORPHAN_VERSION',
      challengeId: 'DECLI_ORPHAN_VERSION',
      status: null,
      ...someOtherCommonData,
      ...dataThatShouldBeTheSame,
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'DECLI_ORPHAN_SKILL',
      challengeId: 'DECLI_ORPHAN_SKILL',
      status: null,
      ...someOtherCommonData,
      ...dataThatShouldBeTheSame,
    });
    const airtableChallenges = [
      airtableBuilder.factory.buildChallenge(domainBuilder.buildChallenge({
        id: 'PROTO',
        airtableId: 'recPROTO',
        alternativeVersion: null,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        ...someOtherCommonData,
        ...dataThatShouldBeTheSame,
      })),
      airtableBuilder.factory.buildChallenge(domainBuilder.buildChallenge({
        id: 'DECLI1_ISO',
        airtableId: 'recDECLI1_ISO',
        alternativeVersion: 1,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        skillId: 'recSkillId',
        instruction: 'B',
        alternativeInstruction: 'B',
        proposals: 'B',
        solution: 'B',
        solutionToDisplay: 'B',
        t1Status: false,
        t2Status: false,
        t3Status: false,
        status: Challenge.STATUSES.ARCHIVE,
        competenceId: 'B',
        embedUrl: 'B',
        embedTitle: 'B',
        embedHeight: 2,
        format: Challenge.FORMATS.DATE,
        locales: ['en'],
        author: ['B'],
        geography: 'EN',
        files: [],
        updatedAt: '2020-10-04',
        createdAt: '2020-07-14',
        validatedAt: '2020-02-02T14:17:30.820Z',
        archivedAt: '2020-03-03T10:47:05.555Z',
        madeObsoleteAt: '2020-04-04T10:47:05.555Z',
        alpha: 2,
        delta: 2,
        version: 1,
        ...dataThatShouldBeTheSame,
      })),
      airtableBuilder.factory.buildChallenge(domainBuilder.buildChallenge({
        id: 'DECLI2',
        airtableId: 'recDECLI2',
        alternativeVersion: 2,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        ...someOtherCommonData,
        'accessibility1': Challenge.ACCESSIBILITY1.KO,
        'accessibility2': Challenge.ACCESSIBILITY2.KO,
        'autoReply': false,
        'contextualizedFields': [Challenge.CONTEXTUALIZED_FIELDS.ATTACHMENTS],
        'declinable': Challenge.DECLINABLES.DIFFICILEMENT,
        'focusable': false,
        'pedagogy': Challenge.PEDAGOGIES.Q_SAVOIR,
        'responsive': Challenge.RESPONSIVES.TABLETTE,
        'shuffled': false,
        'spoil': Challenge.SPOILS.FACILEMENT_SPOILABLE,
        'timer': 456,
        'toRephrase': false,
        'type': Challenge.TYPES.QCU,
      })),
      airtableBuilder.factory.buildChallenge(domainBuilder.buildChallenge({
        id: 'DECLI_ORPHAN_VERSION',
        airtableId: 'recDECLI_ORPHAN_VERSION',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        ...someOtherCommonData,
        ...dataThatShouldBeTheSame,
        version: 2,
      })),
      airtableBuilder.factory.buildChallenge(domainBuilder.buildChallenge({
        id: 'DECLI_ORPHAN_SKILL',
        airtableId: 'recDECLI_ORPHAN_SKILL',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        ...someOtherCommonData,
        ...dataThatShouldBeTheSame,
        skillId: 'someOtherReallyGreatSkill',
      })),
    ];

    airtableChallengesScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .query({
        fields: { '': challengeDatasource.usedFields },
        sort: [{ field: challengeDatasource.sortField, direction: 'asc' }]
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: airtableChallenges });
    return databaseBuilder.commit();
  });

  it('should detect all discrepancies in proto and alternatives if any', async() => {
    // when
    const script = new ScanChallengesForDiscrepanciesBetweenPrototypesAndAlternatives();
    const loggerErrorStub = vi.fn();
    await script.handle({
      options: {},
      logger: { info: vi.fn(), error: loggerErrorStub },
    });

    // then
    expect(loggerErrorStub).toHaveBeenCalledTimes(21);
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "accessibility1"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "accessibility2"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "autoReply"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "contextualizedFields"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "deafAndHardOfHearing"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "declinable"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "focusable"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "hasEmbedInternalValidation"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "isAwarenessChallenge"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "isIncompatibleIpadCertif"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "noValidationNeeded"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "pedagogy"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "requireGafamWebsiteAccess"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "responsive"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "shuffled"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "spoil"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "timer"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "toRephrase"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Proto: PROTO | Alternative: DECLI2 : different value for field "type"');
    expect(loggerErrorStub).toHaveBeenCalledWith('Alternative: DECLI_ORPHAN_VERSION - cannot found related prototype');
    expect(loggerErrorStub).toHaveBeenCalledWith('Alternative: DECLI_ORPHAN_SKILL - cannot found related prototype');
    expect(airtableChallengesScope.isDone()).to.be.true;
  });
});
