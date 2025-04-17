import { PassThrough, pipeline } from 'node:stream';

const NB_CHARS_PER_CHUNK = 65_536;

function getWritableStream() {
  const writableStream = new PassThrough();
  writableStream.headers = {
    'content-type': 'application/json',

    // WHY: to avoid compression because when compressing, the server buffers
    // for too long causing a response timeout.
    'content-encoding': 'identity',
  };
  return writableStream;
}

export function promiseStreamer(promise, writableStream = getWritableStream()) {
  const timer = setInterval(() => {
    writableStream.write('\n');
  }, 1000);

  promise.then((data) => {
    clearInterval(timer);
    pipeline(
      chunk(data),
      writableStream,
    );
  }).catch(() => {
    if (!writableStream.closed) {
      writableStream.write('error');
    }
    clearInterval(timer);
  });
  return writableStream;
}

function* chunk(data) {
  const stringifiedData = JSON.stringify(data);
  for (let i = 0; i < stringifiedData.length; i += NB_CHARS_PER_CHUNK) {
    yield stringifiedData.slice(i, i + NB_CHARS_PER_CHUNK);
  }
}
