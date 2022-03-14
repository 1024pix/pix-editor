const Boom = require('@hapi/boom');
const releaseRepository = require('../infrastructure/repositories/release-repository');
const { queue: createReleaseQueue } = require('../infrastructure/scheduled-jobs/release-job');
const { promiseStreamer } = require('../infrastructure/utils/promise-streamer');
const securityPreHandlers = require('./security-pre-handlers');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/current-content',
      config: {
        handler: function() {
          return promiseStreamer(releaseRepository.getCurrentContent());
        },
      },
    },
    {
      method: 'POST',
      path: '/api/releases',
      config: {
        pre:[{
          method: securityPreHandlers.checkUserHasWriteAccess,
        }],
        handler: async function() {
          const job = await createReleaseQueue.add({ slackNotification: true });
          const promise = async () => {
            const releaseId = await job.finished();
            return releaseRepository.getRelease(releaseId);
          };
          return promiseStreamer(promise());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        handler: async function(req, h) {
          const ifModifiedSince = req.headers['if-modified-since'];
          if (ifModifiedSince != null) {
            const releaseInfo = await releaseRepository.getLatestReleaseInfo();
            const releaseDate = releaseInfo.createdAt.toUTCString();
            if (releaseDate === ifModifiedSince) {
              return h.response().header('Last-Modified', releaseDate);
            }
          }
          const release = await releaseRepository.getLatestRelease();
          return h.response(release).header('Last-Modified', release.createdAt.toUTCString());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/{id}',
      config: {
        handler: async function(request, h) {
          const release = await releaseRepository.getRelease(request.params.id);
          if (release) {
            return h.response(release);
          } else {
            return Boom.notFound();
          }
        },
      },
    },
  ]);
};

exports.name = 'releases-api';
