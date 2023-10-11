import { PassThrough } from 'node:stream';

export function mergeStreams(...inputStreams) {
  const stream = new PassThrough();

  const promises = inputStreams.map((inputStream) => {
    return new Promise((resolve, reject) => {
      inputStream.pipe(stream, { end: false });
      inputStream.on('end', resolve);
      inputStream.on('error', reject);
    });
  });
  Promise.all(promises).then(() => {
    stream.end();
  }).catch((e) => {
    stream.emit('error', e);
  });
  return stream;
}
