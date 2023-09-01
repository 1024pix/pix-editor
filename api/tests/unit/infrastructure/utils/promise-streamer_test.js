import { PassThrough } from 'stream';
import { expect, streamToPromise } from '../../../test-helper.js';
import { promiseStreamer } from '../../../../lib/infrastructure/utils/promise-streamer.js';

describe('Unit | Infrastructure | Utils | Promise Streamer', () => {
  it('write the result of the promise in a writable stream', async () => {
    // given
    const promiseResult = { result: 'job result' };
    const promise = async () => promiseResult;
    const writableStream = new PassThrough();
    const streamPromise = streamToPromise(writableStream);

    // when
    promiseStreamer(promise(), writableStream);
    const result = await streamPromise;

    // then
    expect(JSON.parse(result)).to.deep.equal(promiseResult);
  });

  it('should end the stream with an error when an error occured', async () => {
    //Given
    const promise = async() => { throw new Error(); };
    const writableStream = new PassThrough();
    const streamPromise = streamToPromise(writableStream);

    //When
    promiseStreamer(promise(), writableStream);

    //Then
    expect(await streamPromise).to.match(/error$/);
  });
});
