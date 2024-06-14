import { afterEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../test-helper.js';
import { Challenge } from '../../lib/domain/models/index.js';
import nock from 'nock';
import multipart from 'parse-multipart-data';
import { Buffer } from 'node:buffer';
import { uploadToPhrase } from '../../scripts/upload-multi-locales-to-phrase/index.js';
import { challengeRepository, releaseRepository, skillRepository } from '../../lib/infrastructure/repositories/index.js';

describe('#script.uploadToPhrase',() => {

  afterEach(()=> {
    return knex('focus_phrase').truncate();
  });

  it('should return a super csv', async () => {
    // given
    const skill1 = domainBuilder.buildSkill({
      id:'skill1',
      tubeId: 'tube1',
      name: '@tube1',
      hint_i18n: {
        fr: 'hint skill1 fr',
        nl: 'hint skill1 nl',
      }
    });
    const skill2 = domainBuilder.buildSkill({
      id:'skill2',
      tubeId: 'tube1',
      name: '@tube2',
      hint_i18n: {
        fr: 'hint skill2 fr',
        es: 'hint skill2 es',
      }
    });
    databaseBuilder.factory.buildTranslation({
      key: 'skill.skill1.hint',
      locale: 'fr',
      value: 'hint skill1 fr'
    });
    databaseBuilder.factory.buildTranslation({
      key: 'skill.skill1.hint',
      locale: 'nl',
      value: 'hint skill1 nl'
    });
    databaseBuilder.factory.buildTranslation({
      key: 'skill.skill2.hint',
      locale: 'fr',
      value: 'hint skill2 fr'
    });
    databaseBuilder.factory.buildTranslation({
      key: 'skill.skill2.hint',
      locale: 'es',
      value: 'hint skill2 es'
    });
    const challengeA = domainBuilder.buildChallenge({
      id: 'challengeAID',
      skillId: skill1.id,
      status: Challenge.STATUSES.VALIDE,
      locales: ['fr'],
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeAID',
          challengeId: 'challengeAID',
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeA_NL_ID',
          challengeId: 'challengeAID',
          locale: 'nl',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeA_ES_ID',
          challengeId: 'challengeAID',
          locale: 'es',
        }),
      ],
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeAID.instruction',
      locale: 'fr',
      value: 'challengeAID instruction FR',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeAID.instruction',
      locale: 'es',
      value: 'challengeAID instruction ES',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeAID.instruction',
      locale: 'nl',
      value: 'challengeAID instruction NL',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeAID.illustrationAlt',
      locale: 'fr',
      value: 'challengeAID illustrationAlt FR',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeAID.illustrationAlt',
      locale: 'nl',
      value: 'challengeAID illustrationAlt NL',
    });
    const challengeB = domainBuilder.buildChallenge({
      id: 'challengeBId',
      skillId: skill2.id,
      status: Challenge.STATUSES.VALIDE,
      locales: ['fr-fr'],
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeBId',
          challengeId: 'challengeBId',
          locale: 'fr-fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeB_ES_Id',
          challengeId: 'challengeBId',
          locale: 'jp',
        }),
      ],
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeBId.instruction',
      locale: 'fr-fr',
      value: 'challengeBId instruction FRfr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeBId.instruction',
      locale: 'jp',
      value: 'ITADAKISMASU',
    });
    const challengeC = domainBuilder.buildChallenge({
      id: 'challengeCId',
      skillId: skill2.id,
      status: Challenge.STATUSES.VALIDE,
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeCId',
          challengeId: 'challengeCId',
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeC_NL_Id',
          challengeId: 'challengeCId',
          locale: 'nl',
        }),
      ],
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeCId.instruction',
      locale: 'fr',
      value: 'challengeCId instruction FR',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeCId.instruction',
      locale: 'nl',
      value: 'challengeCId instruction NL',
    });
    const challengeD = domainBuilder.buildChallenge({
      id: 'challengeDId',
      skillId: skill2.id,
      status: Challenge.STATUSES.PROPOSE,
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeDId',
          challengeId: 'challengeDId',
          locale: 'fr',
        }),
      ],
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeDId.instruction',
      locale: 'fr',
      value: 'challengeDId instruction FR',
    });

    await databaseBuilder.commit();

    await knex('focus_phrase').insert([
      {
        type: 'skill',
        persistantId: skill1.id
      }, {
        type: 'skill',
        persistantId: skill2.id
      }, {
        type: 'challenge',
        persistantId: challengeA.id
      }, {
        type: 'challenge',
        persistantId: challengeB.id
      }, {
        type: 'challenge',
        persistantId: challengeC.id
      }, {
        type: 'challenge',
        persistantId: challengeD.id
      }
    ]);

    const releaseChallengeA = domainBuilder.buildChallengeForRelease(challengeA);
    const releaseChallengeB = domainBuilder.buildChallengeForRelease(challengeB);
    const releaseChallengeC = domainBuilder.buildChallengeForRelease(challengeC);
    const releaseChallengeD = domainBuilder.buildChallengeForRelease(challengeD);
    const releaseSkill1 = domainBuilder.buildSkillForRelease(skill1);
    const releaseSkill2 = domainBuilder.buildSkillForRelease(skill2);
    const releaseTube = domainBuilder.buildTubeForRelease({
      id: 'tube1',
      competenceId: 'competenceId1',
      name: '@tube'
    });
    const releaseCompetence = domainBuilder.buildCompetenceForRelease({
      id: 'competenceId1',
      areaId: 'areaId1',
      index: '1.1'
    });
    const releaseArea = domainBuilder.buildAreaForRelease({
      id: 'areaId1',
      frameworkId: 'frameworkId1',
      code: '1'
    });
    const releaseFramework = domainBuilder.buildFrameworkForRelease({
      id: 'frameworkId1',
      name: 'pix'
    });
    const content = domainBuilder.buildContentForRelease({
      frameworks: [releaseFramework],
      areas: [releaseArea],
      competences: [releaseCompetence],
      tubes: [releaseTube],
      skills: [releaseSkill1, releaseSkill2],
      challenges: [releaseChallengeA, releaseChallengeB, releaseChallengeC, releaseChallengeD],
    });
    const release = domainBuilder.buildDomainRelease({ content });
    vi.spyOn(skillRepository, 'list').mockImplementation(()=> {
      return [skill1, skill2];
    });
    vi.spyOn(challengeRepository, 'list').mockImplementation(()=> {
      return [challengeA, challengeB, challengeC, challengeD];
    });
    vi.spyOn(releaseRepository, 'create').mockImplementation(() => {
      return 'myReleaseID';
    });
    vi.spyOn(releaseRepository, 'getRelease').mockImplementation(() => {
      return release;
    });
    const phraseLocalesAPI = nock('https://api.phrase.com')
      .get('/v2/projects/MY_PHRASE_PROJECT_ID/locales')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .reply(200, [
        {
          id: 'frLocaleId',
          name: 'fr',
          code: 'fr',
          default: true,
        },
        {
          id: 'nlLocaleId',
          name: 'nl',
          code: 'nl',
          default: false,
        },
      ]);

    const parseFormData = (body) => {
      const boundary = body.match(/.*/g)[0].slice(2);
      return multipart.parse(Buffer.from(body), boundary);
    };
    const findFormDataParameter = (parsedBody, name) => {
      return parsedBody.find((part) => part.name === name);
    };
    const matchFormDataParameter = (parsedBody, name, value) => {
      return findFormDataParameter(parsedBody, name).data.toString() === value;
    };

    let csvContent;
    const phraseUploadAPI = nock('https://api.phrase.com')
      .post('/v2/projects/MY_PHRASE_PROJECT_ID/uploads', (body) => {
        const parsedBody = parseFormData(body);
        csvContent = findFormDataParameter(parsedBody, 'file').data.toString();
        return matchFormDataParameter(parsedBody, 'locale_id', 'frLocaleId') &&
          matchFormDataParameter(parsedBody, 'file_format', 'csv') &&
          matchFormDataParameter(parsedBody, 'update_descriptions', 'false') &&
          matchFormDataParameter(parsedBody, 'update_translations', 'false') &&
          matchFormDataParameter(parsedBody, 'skip_upload_tags', 'true') &&
          matchFormDataParameter(parsedBody, 'locale_mapping[es]', '2') &&
          matchFormDataParameter(parsedBody, 'locale_mapping[fr]', '3') &&
          matchFormDataParameter(parsedBody, 'locale_mapping[nl]', '4') &&
          matchFormDataParameter(parsedBody, 'format_options[key_index]', '1') &&
          matchFormDataParameter(parsedBody, 'format_options[tag_column]', '5') &&
          matchFormDataParameter(parsedBody, 'format_options[comment_index]', '6') &&
          matchFormDataParameter(parsedBody, 'format_options[header_content_row]', 'true');
      })
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .reply(201, {});

    // when
    await uploadToPhrase();

    expect(phraseLocalesAPI.isDone()).to.be.true;
    expect(phraseUploadAPI.isDone()).to.be.true;
    expect(csvContent).toEqual(
      `key,es,fr,nl,tags,description
skill.skill1.hint,,hint skill1 fr,hint skill1 nl,"acquis,pix-1-1.1-tube-tube1,pix-1-1.1-tube,pix-1-1.1,pix-1,pix",
skill.skill2.hint,hint skill2 es,hint skill2 fr,,"acquis,pix-1-1.1-tube-tube2,pix-1-1.1-tube,pix-1-1.1,pix-1,pix",
challenge.challengeAID.instruction,challengeAID instruction ES,challengeAID instruction FR,challengeAID instruction NL,"epreuve,pix-1-1.1-tube-tube1-valide,pix-1-1.1-tube-tube1,pix-1-1.1-tube,pix-1-1.1,pix-1,pix","Prévisualisation FR: http://test.site/api/challenges/challengeAID/preview
Prévisualisation ES: http://test.site/api/challenges/challengeAID/preview?locale=es
Prévisualisation NL: http://test.site/api/challenges/challengeAID/preview?locale=nl
Pix Editor: http://test.site/challenge/challengeAID"
challenge.challengeAID.illustrationAlt,,challengeAID illustrationAlt FR,challengeAID illustrationAlt NL,"epreuve,pix-1-1.1-tube-tube1-valide,pix-1-1.1-tube-tube1,pix-1-1.1-tube,pix-1-1.1,pix-1,pix","Prévisualisation FR: http://test.site/api/challenges/challengeAID/preview
Prévisualisation ES: http://test.site/api/challenges/challengeAID/preview?locale=es
Prévisualisation NL: http://test.site/api/challenges/challengeAID/preview?locale=nl
Pix Editor: http://test.site/challenge/challengeAID"
challenge.challengeCId.instruction,,challengeCId instruction FR,challengeCId instruction NL,"epreuve,pix-1-1.1-tube-tube2-valide,pix-1-1.1-tube-tube2,pix-1-1.1-tube,pix-1-1.1,pix-1,pix","Prévisualisation FR: http://test.site/api/challenges/challengeCId/preview
Prévisualisation ES: http://test.site/api/challenges/challengeCId/preview?locale=es
Prévisualisation NL: http://test.site/api/challenges/challengeCId/preview?locale=nl
Pix Editor: http://test.site/challenge/challengeCId"`);
  });
});
