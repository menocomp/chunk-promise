const { chunk } = require('./chunk');
const { sleep, reflect } = require('./async');
const { identity, compose } = require('./combinators');

const promiseChainLog = [];

const recursivePromiseChunk = chunk => res => Promise.all([...res, ...chunk]);

const chainChunks = (promiseChain, index, chunks, promiseFlavor) => {
  let runFn, runFnStr;
  const tab = '\t';

  if (promiseFlavor === PromiseFlavor.PromiseAllSettled) {
    runFn = compose(reflect)(identity);
    runFnStr = `f => 
    ${tab.repeat(2)}f()
    ${tab.repeat(3)}.then(value => ({ status: 'fulfilled', value }))
    ${tab.repeat(3)}.catch(reason => ({ status: "rejected", reason }))`;
  } else {
    runFn = identity;
    runFnStr = `f => f()`;
  }

  if (index === 0) {
    promiseChain = Promise.all(chunks[0].map(runFn));
    promiseChainLog.push(
      `Promise.all( [ ${chunks[0].join(', ')} ]
      ${tab.repeat(1)}.map(${runFnStr})
      )`
    );
  } else {
    promiseChain = promiseChain.then(res =>
      recursivePromiseChunk(chunks[index].map(runFn))(res)
    );
    promiseChainLog.push(
      `.then((res) => Promise.all( [ ...res, ...[ ${chunks[index].join(', ')} ]
      ${tab.repeat(1)}.map(${runFnStr})
      ]))`
    );
  }
  return promiseChain;
};

const chainCallback = (promiseChain, index, chunks, callback) => {
  if (callback) {
    promiseChain = promiseChain.then(res => {
      return callback(res.slice(-chunks[index].length), index, res).then(
        () => res
      );
    });
    promiseChainLog.push(
      `.then((res) => {
      \t\treturn callback(chunkResults, ${index}, allResults).then(() => res);
        })`
    );
  }
  return promiseChain;
};

const chainSleep = (promiseChain, sleepMs) => {
  if (sleepMs !== undefined) {
    promiseChain = promiseChain.then(sleep(sleepMs));
    promiseChainLog.push(
      `.then((res) => new Promise(resolve => setTimeout(() => resolve(res), ${sleepMs})))`
    );
  }
  return promiseChain;
};

const PromiseFlavor = {
  PromiseAll: 'PromiseAll',
  PromiseAllSettled: 'PromiseAllSettled'
};

const chunkPromise = (
  promiseArr,
  {
    concurrent = Infinity,
    sleepMs,
    callback,
    promiseFlavor = PromiseFlavor.PromiseAll,
    logMe = false
  } = {}
) => {
  const chunks = chunk(promiseArr, concurrent);

  let promiseChain = Promise.resolve();

  for (let index = 0; index <= chunks.length - 1; index++) {
    promiseChain = chainChunks(promiseChain, index, chunks, promiseFlavor);

    promiseChain = chainCallback(promiseChain, index, chunks, callback);

    promiseChain = chainSleep(promiseChain, sleepMs);
  }
  logMe && console.log(promiseChainLog.join('\n'));
  return promiseChain;
};

const ChunkPromiseCallbackForceStopError = class extends Error {};

exports = module.exports = {
  chunkPromise,
  PromiseFlavor,
  ChunkPromiseCallbackForceStopError
};
