const { chunk } = require("./chunk");

const sleepFn = ms => new Promise(resolve => setTimeout(resolve, ms));

const recursivePromiseChunk = chunk => res => Promise.all([...res, ...chunk]);

const promiseAll = (
  promiseArr,
  { concurrent = Infinity, sleep, callback } = {}
) => {
  const chunks = chunk(promiseArr, concurrent);

  let promiseChain = Promise.all([...chunks[0]]);

  for (let index = 1; index <= chunks.length - 1; index++) {
    if (callback) {
      promiseChain = promiseChain.then(res => {
        return callback(res).then(() => res);
      });
    }
    if (sleep) {
      promiseChain = promiseChain.then(res => {
        return sleepFn(sleep).then(() => res);
      });
    }
    promiseChain = promiseChain.then(recursivePromiseChunk(chunks[index]));
  }
  return promiseChain;
};

exports = module.exports = { promiseAll };
