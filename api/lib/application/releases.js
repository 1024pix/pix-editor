const { PassThrough } = require('stream');
const Boom = require('@hapi/boom');
const releaseRepository = require('../infrastructure/repositories/release-repository');
const { queue: createReleaseQueue } = require('../infrastructure/scheduled-jobs/release-job');
const { promiseStreamer } = require('../infrastructure/utils/promise-streamer');

function _getWritableStream() {
  const writableStream = new PassThrough();
  writableStream.headers = {
    'content-type': 'application/json',

    // WHY: to avoid compression because when compressing, the server buffers
    // for too long causing a response timeout.
    'content-encoding': 'identity',
  };
  return writableStream;
}

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/current-content',
      config: {
        handler: function() {
          return promiseStreamer(releaseRepository.getCurrentContent(), _getWritableStream());
        },
      },
    },
    {
      method: 'POST',
      path: '/api/releases',
      config: {
        handler: async function() {
          const job = await createReleaseQueue.add();
          const promise = async () => {
            const releaseId = await job.finished();
            return releaseRepository.getRelease(releaseId);
          };
          return promiseStreamer(promise(), _getWritableStream());
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/latest',
      config: {
        handler: async function() {
          const release = await releaseRepository.getLatestRelease();
          return JSON.stringify(release);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/releases/{id}',
      config: {
        handler: async function(request) {
          const release = await releaseRepository.getRelease(request.params.id);
          if (release) {
            return JSON.stringify(release);
          } else {
            return Boom.notFound();
          }
        },
      },
    },
  ]);
};

exports.name = 'releases-api';
