export async function streamToPromise(stream) {
  return streamToPromiseArray(stream).then((array) => {
    return array.join('');
  });
}

export function streamToPromiseArray(stream) {
  return new Promise((resolve, reject) => {
    const result = [];
    stream.on('data', (data) => {
      result.push(data);
    });
    stream.on('end', () => {
      resolve(result);
    });
    stream.on('error', reject);
  });
}
