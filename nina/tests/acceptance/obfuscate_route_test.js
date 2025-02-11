import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { createServer } from '../../server.js';
import { lcms } from '../../lib/config.js';

describe('Acceptance | Route | obfuscateRoute', () => {

  describe('GET /api/releases/latest', () => {
    let releaseScope, date;
    const challengeOriginalData = {
      QCM: {
        type: 'QCM',
        instruction: 'original instruction for type QCM',
        proposals: 'original proposals for type QCM',
        solution: 'original solution for type QCM',
        some: 'otherFieldForQCM',
        fields: 'thatStayHereQCM',
      },
      QCU: {
        type: 'QCU',
        instruction: 'original instruction for type QCU',
        proposals: 'original proposals for type QCU',
        solution: 'original solution for type QCU',
        some: 'otherFieldForQCU',
        fields: 'thatStayHereQCU',
      },
      QROC: {
        type: 'QROC',
        instruction: 'original instruction for type QROC',
        proposals: 'original proposals for type QROC',
        solution: 'original solution for type QROC',
        some: 'otherFieldForQROC',
        fields: 'thatStayHereQROC',
      },
      QROCM: {
        type: 'QROCM',
        instruction: 'original instruction for type QROCM',
        proposals: 'original proposals for type QROCM',
        solution: 'original solution for type QROCM',
        some: 'otherFieldForQROCM',
        fields: 'thatStayHereQROCM',
      },
      'QROCM-ind': {
        type: 'QROCM-ind',
        instruction: 'original instruction for type QROCM-ind',
        proposals: 'original proposals for type QROCM-ind',
        solution: 'original solution for type QROCM-ind',
        some: 'otherFieldForQROCM-ind',
        fields: 'thatStayHereQROCM-ind',
      },
      'QROCM-dep': {
        type: 'QROCM-dep',
        instruction: 'original instruction for type QROCM-dep',
        proposals: 'original proposals for type QROCM-dep',
        solution: 'original solution for type QROCM-dep',
        some: 'otherFieldForQROCM-dep',
        fields: 'thatStayHereQROCM-dep',
      },
      QMAIL: {
        type: 'QMAIL',
        instruction: 'original instruction for type QMAIL',
        proposals: 'original proposals for type QMAIL',
        solution: 'original solution for type QMAIL',
        some: 'otherFieldForQMAIL',
        fields: 'thatStayHereQMAIL',
      },
    };

    beforeEach(async () => {
      date = new Date();
      releaseScope = nock(lcms.baseUrl)
        .get('/releases/latest')
        .matchHeader('authorization', `Bearer ${lcms.token}`)
        .reply(200, {
          id: 1,
          createdAt: date,
          content: {
            frameworks: [
              { some: 'framework', i: 'leave untouch' },
              { some: 'otherFramework', i: 'leave untouch' },
            ],
            areas: [
              { some: 'area', i: 'leave untouch' },
              { some: 'otherArea', i: 'leave untouch' },
            ],
            competences: [
              { some: 'competence', i: 'leave untouch' },
              { some: 'otherCompetence', i: 'leave untouch' },
            ],
            thematics: [
              { some: 'thematic', i: 'leave untouch' },
              { some: 'otherThematic', i: 'leave untouch' },
            ],
            tubes: [
              { some: 'tube', i: 'leave untouch' },
              { some: 'otherTube', i: 'leave untouch' },
            ],
            skills: [
              { some: 'skill', i: 'leave untouch' },
              { some: 'otherSkill', i: 'leave untouch' },
            ],
            challenges: [
              challengeOriginalData['QCM'],
              challengeOriginalData['QCU'],
              challengeOriginalData['QROC'],
              challengeOriginalData['QROCM'],
              challengeOriginalData['QROCM-ind'],
              challengeOriginalData['QROCM-dep'],
              challengeOriginalData['QMAIL'],
              { ...challengeOriginalData['QCM'], embedUrl: 'original embed URL', embedTitle: 'original embed Title' },
              { ...challengeOriginalData['QCM'], illustrationUrl: 'original illustrationUrl', illustrationAlt: 'original illustrationAlt' },
              { ...challengeOriginalData['QCM'], attachments: ['original', 'attachments'] },
              { ...challengeOriginalData['QCM'], alternativeInstruction: 'original alternativeInstruction' },
              { type: 'unknownType', i: 'should be filtered out' },
            ],
            tutorials: [
              { some: 'tutorial', i: 'leave untouch' },
              { some: 'otherTutorial', i: 'leave untouch' },
            ],
            missions: [
              { some: 'mission', i: 'leave untouch' },
              { some: 'otherMission', i: 'leave untouch' },
            ],
            courses: [
              { some: 'course', i: 'leave untouch' },
              { some: 'otherCourse', i: 'leave untouch' },
            ],
          },
        });
    });

    it('should respond with status 200 and an obfuscated release', async () => {
      // given
      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/releases/latest',
      });

      // then
      expect(response.statusCode).toBe(200);
      expect(releaseScope.isDone()).toBe(true);
      expect(response.result).toEqual({
        id: 1,
        createdAt: date.toISOString(),
        content: {
          frameworks: [
            { some: 'framework', i: 'leave untouch' },
            { some: 'otherFramework', i: 'leave untouch' },
          ],
          areas: [
            { some: 'area', i: 'leave untouch' },
            { some: 'otherArea', i: 'leave untouch' },
          ],
          competences: [
            { some: 'competence', i: 'leave untouch' },
            { some: 'otherCompetence', i: 'leave untouch' },
          ],
          thematics: [
            { some: 'thematic', i: 'leave untouch' },
            { some: 'otherThematic', i: 'leave untouch' },
          ],
          tubes: [
            { some: 'tube', i: 'leave untouch' },
            { some: 'otherTube', i: 'leave untouch' },
          ],
          skills: [
            { some: 'skill', i: 'leave untouch' },
            { some: 'otherSkill', i: 'leave untouch' },
          ],
          challenges: [
            {
              type: 'QCM',
              some: 'otherFieldForQCM',
              fields: 'thatStayHereQCM',
              instruction: 'épreuve de type QCM',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
              solution: '1, 2, 3, 5, 6',
            },
            {
              type: 'QCU',
              some: 'otherFieldForQCU',
              fields: 'thatStayHereQCU',
              instruction: 'épreuve de type QCU',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
              solution: '6',
            },
            {
              type: 'QROC',
              some: 'otherFieldForQROC',
              fields: 'thatStayHereQROC',
              instruction:'épreuve de type QROC',
              proposals:'de quel type suis-je: ${QROC}',
              solution:'QROC',
            },
            {
              type: 'QROCM',
              some: 'otherFieldForQROCM',
              fields: 'thatStayHereQROCM',
              instruction: 'épreuve de type QROCM',
              proposals: 'de quel type suis-je: ${QROC} ${M}',
              solution: 'QROC\nM',
            },
            {
              type: 'QROCM-ind',
              some: 'otherFieldForQROCM-ind',
              fields: 'thatStayHereQROCM-ind',
              instruction: 'épreuve de type QROCMIND',
              proposals: 'de quel type suis-je: ${QROCM} ${IND}',
              solution: 'QROCM :\n- QROCM\nIND :\n- IND\n- INDEPENDANT',
            },
            {
              type: 'QROCM-dep',
              some: 'otherFieldForQROCM-dep',
              fields: 'thatStayHereQROCM-dep',
              instruction: 'épreuve de type QROCMDEP',
              proposals: 'de quel type suis-je: ${QROCM} ${DEP}',
              solution: 'QROCM :\n- QROCM\nDEP :\n- DEP\n- DEPENDANT',
            },
            {
              type: 'QMAIL',
              some: 'otherFieldForQMAIL',
              fields: 'thatStayHereQMAIL',
              instruction: 'épreuve de type QMAIL',
              proposals: 'de quel type suis-je',
              solution: '1',
            },
            {
              type: 'QCM',
              some: 'otherFieldForQCM',
              fields: 'thatStayHereQCM',
              instruction: 'épreuve de type QCM',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
              solution: '1, 2, 3, 5, 6',
              embedUrl: 'https://epreuves.pix.fr/old/qcm_unite-4.html',
              embedTitle: 'embedTitle',
            },
            {
              type: 'QCM',
              some: 'otherFieldForQCM',
              fields: 'thatStayHereQCM',
              instruction: 'épreuve de type QCM',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
              solution: '1, 2, 3, 5, 6',
              illustrationUrl: 'https://dl.pix.fr/rec3JeDqiooMO30mG1623769711702/smartphone.png',
              illustrationAlt: 'illustrationAlt',
            },
            {
              type: 'QCM',
              some: 'otherFieldForQCM',
              fields: 'thatStayHereQCM',
              instruction: 'épreuve de type QCM',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
              solution: '1, 2, 3, 5, 6',
              attachments: [
                'https://dl.pix.fr/recPNXDxDoH0jmTkP1623769823328/Pix_lorem.odt',
                'https://dl.pix.fr/receAYJXtFNXv1eLT1623769823110/Pix_lorem.docx'
              ],
            },
            {
              type: 'QCM',
              some: 'otherFieldForQCM',
              fields: 'thatStayHereQCM',
              instruction: 'épreuve de type QCM',
              proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
              solution: '1, 2, 3, 5, 6',
              alternativeInstruction: 'alternativeInstruction',
            },
          ],
          tutorials: [
            { some: 'tutorial', i: 'leave untouch' },
            { some: 'otherTutorial', i: 'leave untouch' },
          ],
          missions: [
            { some: 'mission', i: 'leave untouch' },
            { some: 'otherMission', i: 'leave untouch' },
          ],
          courses: [
            { some: 'course', i: 'leave untouch' },
            { some: 'otherCourse', i: 'leave untouch' },
          ],
        },
      });
    });
  });
});
