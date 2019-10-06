const {
  chunkPromise,
  PromiseFlavor,
  ChunkPromiseCallbackForceStopError
} = require('..');

const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => Promise.resolve(3),
  () => Promise.resolve(4),
  () => Promise.resolve(5),
  () => Promise.resolve(6),
  () => Promise.resolve(7)
];

const promiseAllSettledCallback = async (chunkResults, index, allResults) => {
  if (chunkResults.some(p => p.status === 'fulfilled')) {
    console.log(`chunk (${index}): has success results`);
  } else {
    console.log(`chunk (${index}): has no success results`);
  }
};

const promiseAllCallback = async (chunkResults, index, allResults) => {
  console.log(`chunk (${index}): has success results`);
  if (index === 2) {
    throw new ChunkPromiseCallbackForceStopError(
      `Callback force stop at chunk index ${index}`
    );
  }
};

chunkPromise(promiseArr, {
  concurrent: 2,
  sleepMs: 2000,
  callback: promiseAllCallback,
  promiseFlavor: PromiseFlavor.PromiseAll,
  logMe: true
})
  .then(res => {
    console.log('success');
    console.log(res);
  })
  .catch(err => {
    if (err instanceof ChunkPromiseCallbackForceStopError) {
      console.log('Force stop');
    } else {
      console.log('failed');
      console.log(err);
    }
  });
