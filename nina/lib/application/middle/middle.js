import { lcms } from '../../config.js';

export const getLatestReleaseFromLCMSApi = async(request, h) => {
  const requestUrl = `${lcms.baseUrl}/releases/latest`;
  try {
    const _request = await fetch(requestUrl, {
      'headers': {
        'Authorization': `Bearer ${lcms.token}`
      }
    });
    const response = await _request.json();
    if (_request.status.toString().startsWith('2')) {
      const release = obfuscatedRelease(response.content);
      return h.response({ ...response, content: release }).code(200);
    } else {
      return h.response(response).code(response.errors[0].code);
    }
  } catch (e) {
    console.error(e);
    return h.response('Something went wrong when fetching from LCMS API').code(400);
  }
};

function obfuscatedRelease(release) {
  release.challenges = release.challenges
    .filter(byKnownType)
    .map(obfuscateChallenge);
  return release;
}

function byKnownType(challenge) {
  return knownTypes.includes(challenge?.type);
}

function obfuscateChallenge(challenge) {
  const cloneBaseChallenge = {
    ...challenge,
    ...challengeFakeData[challenge.type],
  };

  if (challenge.embedUrl) {
    cloneBaseChallenge.embedUrl = 'https://epreuves.pix.fr/old/qcm_unite-4.html';
    cloneBaseChallenge.embedTitle = 'embedTitle';
  }
  if (challenge.illustrationUrl) {
    cloneBaseChallenge.illustrationUrl = 'https://dl.pix.fr/rec3JeDqiooMO30mG1623769711702/smartphone.png';
    cloneBaseChallenge.illustrationAlt = 'illustrationAlt';
  }

  if (challenge.attachments) {
    cloneBaseChallenge.attachments = [
      'https://dl.pix.fr/recPNXDxDoH0jmTkP1623769823328/Pix_lorem.odt',
      'https://dl.pix.fr/receAYJXtFNXv1eLT1623769823110/Pix_lorem.docx'
    ];
  }

  if (challenge.alternativeInstruction) {
    cloneBaseChallenge.alternativeInstruction = 'alternativeInstruction';
  }

  return cloneBaseChallenge;
}
const knownTypes = ['QCM', 'QCU', 'QROC', 'QROCM', 'QROCM-ind', 'QROCM-dep', 'QMAIL'];

const challengeFakeData = {
  QCM: {
    instruction: 'épreuve de type QCM',
    proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
    solution: '1, 2, 3, 5, 6',
  },
  QCU: {
    instruction: 'épreuve de type QCU',
    proposals: '- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n',
    solution: '6',
  },
  QROC: {
    instruction:'épreuve de type QROC',
    proposals:'de quel type suis-je: ${QROC}',
    solution:'QROC',
  },
  QROCM: {
    instruction: 'épreuve de type QROCM',
    proposals: 'de quel type suis-je: ${QROC} ${M}',
    solution: 'QROC\nM',
  },
  'QROCM-ind': {
    instruction: 'épreuve de type QROCMIND',
    proposals: 'de quel type suis-je: ${QROCM} ${IND}',
    solution: 'QROCM :\n- QROCM\nIND :\n- IND\n- INDEPENDANT',
  },
  'QROCM-dep': {
    instruction: 'épreuve de type QROCMDEP',
    proposals: 'de quel type suis-je: ${QROCM} ${DEP}',
    solution: 'QROCM :\n- QROCM\nDEP :\n- DEP\n- DEPENDANT',
  },
  QMAIL: {
    instruction: 'épreuve de type QMAIL',
    proposals: 'de quel type suis-je',
    solution: '1',
  }
};
