import {lcms} from '../../config.js';

export async function register(server) {
    server.route([
        {
            method: 'GET',
            path: '/api/releases/latest',
            config: {
                auth: false,
                handler: getLatestReleaseFromLCMSApi,
                tags: ['api']
            }
        },
    ]);
}

const getLatestReleaseFromLCMSApi = async(request, h) => {
    const requestUrl = `${lcms.baseUrl}/releases/latest`
    try {
        const _request = await fetch(requestUrl, {
            'headers': {
                'Authorization': `Bearer ${lcms.token}`
            }
        });
        if (_request.status === 200) {
            const response = await _request.json();
            const release = obfuscatedRelease(response.content)
            return h.response({content: release});
        }
    } catch (e) {
        console.error(e);
        return h.response().code(204);
    }
}



function obfuscatedRelease(release) {
    release.challenges = release.challenges
      .filter(byValideType)
      .map(obfuscateChallenge);
    return release;
}

function byValideType(challenge) {
    return valideTypes.includes(challenge?.type);
}

function obfuscateChallenge(challenge) {
    if(challenge.embedUrl) {
        challenge.embedUrl = 'https://epreuves.pix.fr/old/qcm_unite-4.html';
        challenge.embedTitle = 'embedTitle';
    }
    if (challenge.illustrationUrl) {
        challenge.illustrationUrl = 'https://dl.pix.fr/rec3JeDqiooMO30mG1623769711702/smartphone.png';
        challenge.illustrationAlt = 'illustrationAlt';
    }

    if(challenge.attachments) {
        challenge.attachments = [
            'https://dl.pix.fr/recPNXDxDoH0jmTkP1623769823328/Pix_lorem.odt',
            'https://dl.pix.fr/receAYJXtFNXv1eLT1623769823110/Pix_lorem.docx'
         ];
    }

    if(challenge.alternativeInstruction) {
        challenge.alternativeInstruction = 'alternativeInstruction';
    }

    return {
        ...challenge,
        ...challengeFakeData[challenge.type]
    };
}
const valideTypes = ['QCM', 'QCU', 'QROC', 'QROCM', 'QROCM-ind', 'QROCM-dep', 'QMAIL']

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
}

export const name = 'middle-api';
