const { chunkPromise, PromiseLogic } = require('..');

const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5),
  () => Promise.reject(6),
  () => Promise.resolve(7),
];

const promiseAllSettled = async (chunkResults, index, allResults) => {
  if (chunkResults.some((p) => p.status === 'fulfilled')) {
    console.log(`chunk (${index}): has success results`);
  } else {
    console.log(`chunk (${index}): has no success results`);
  }
};

chunkPromise(promiseArr, {
  concurrent: 2,
  sleepMs: 2000,
  callback: promiseAllSettled,
  promiseLogic: PromiseLogic.PromiseAllSettled,
})
  .then((res) => {
    console.log('success');
    console.log(res);
  })
  .catch((err) => {
    console.log('failed');
    console.log(err);
  });
