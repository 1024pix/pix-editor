export async function register(server) {
    server.route([
        {
            method: 'GET',
            path: '/api/releases/latest',
            config: {
                auth: false,
                handler: async (request, h) => {
                    return h.response().code(204);
                },
                tags: ['api']
            }
        },
    ]);
}

export const name = 'middle-api';
