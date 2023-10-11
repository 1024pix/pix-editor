import { describe, expect, it } from 'vitest';
import { PassThrough } from 'node:stream';
import { streamToPromise } from '../../../test-helper.js';
import { mergeStreams } from '../../../../lib/infrastructure/utils/merge-stream.js';

describe('Unit | Infrastructure | Utils | Merge Stream', () => {
  it('merges the input streams and ends the destination stream', async () => {
    // given
    const writableStream1 = new PassThrough();
    const writableStream2 = new PassThrough();
    const promise = streamToPromise(mergeStreams(writableStream1, writableStream2));

    // when
    writableStream1.write('plop');
    writableStream1.end();

    setTimeout(() => {
      writableStream2.write('plop2');
      writableStream2.end();
    }, 200);

    // then
    await expect(promise).resolves.toBe('plopplop2');
  });

  it('merges the input streams and forward error to the destination stream', async () => {
    // given
    const writableStream1 = new PassThrough();
    const writableStream2 = new PassThrough();
    const promise = streamToPromise(mergeStreams(writableStream1, writableStream2));

    // when
    writableStream1.emit('error', 'my error');

    setTimeout(() => {
      writableStream2.write('plop2');
      writableStream2.end();
    }, 200);

    // then
    await expect(promise).rejects.toBe('my error');
  });
});
