import {lcms} from "../../config.js";

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
            return h.response(response);
        }
    } catch (e) {
        console.error(e);
        return h.response().code(204);
    }
}

export const name = 'middle-api';
