const { PassThrough } = require('stream');
const { expect, streamToPromise } = require('../../../test-helper');
const { jobStreamer } = require('../../../../lib/infrastructure/utils/job-streamer');

describe('Unit | Infrastructure | Utils | Job Streamer', () => {
  it('write the result of the job in a writable stream', async () => {
    // given
    const jobResult = { result: 'job result' };
    const job = { finished: async () => jobResult };
    const writableStream = new PassThrough();
    const streamPromise = streamToPromise(writableStream);

    // when
    jobStreamer(job, writableStream);
    const result = await streamPromise;

    // then
    expect(JSON.parse(result)).to.deep.equal(jobResult);
  });

  it('should end the stream with an error when an error occured', async () => {
    //Given
    const job = { finished: async() => { throw new Error(); } };
    const writableStream = new PassThrough();
    const streamPromise = streamToPromise(writableStream);

    //When
    jobStreamer(job, writableStream);

    //Then
    expect(await streamPromise).to.match(/error$/);
  });
});
