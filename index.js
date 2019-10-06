const { chunk } = require('./chunk');
const { sleep, reflect } = require('./async');
const { identity, compose } = require('./combinators');

const promiseChainLog = [];

const recursivePromiseChunk = (chunk) => (res) => {
  return Promise.all([...res, ...chunk]);
};

const chainChunks = (promiseChain, index, chunks, promiseLogic) => {
  const runFn =
    promiseLogic === PromiseLogic.PromiseAllSettled
      ? compose(reflect)(identity)
      : identity;

  if (index === 0) {
    promiseChain = Promise.all(chunks[0].map(runFn));
    promiseChainLog.push(
      `Promise.all( [ ${chunks[0].join(', ')} ].map(f => f()) )`,
    );
  } else {
    promiseChain = promiseChain.then((res) =>
      recursivePromiseChunk(chunks[index].map(runFn))(res),
    );
    promiseChainLog.push(
      `.then((res) => {
        \treturn Promise.all( [ ...res, ...[ ${chunks[index].join(
          ', ',
        )} ].map(f => f()) ] )
        })`,
    );
  }
  return promiseChain;
};

const chainCallback = (promiseChain, index, chunks, callback) => {
  if (callback) {
    promiseChain = promiseChain.then((res) => {
      return callback(res.slice(-chunks[index].length), index, res).then(
        () => res,
      );
    });
    promiseChainLog.push(
      `.then((res) => {
      \t\treturn callback(res, ${index}).then(() => res);
        })`,
    );
  }
  return promiseChain;
};

const chainSleep = (promiseChain, index, sleepMs) => {
  if (sleepMs !== undefined) {
    promiseChain = promiseChain.then(sleep(sleepMs));
  }
  return promiseChain;
};

const PromiseLogic = {
  PromiseAll: 'PromiseAll',
  PromiseAllSettled: 'PromiseAllSettled',
};

const chunkPromise = (
  promiseArr,
  {
    concurrent = Infinity,
    sleepMs,
    callback,
    promiseLogic = PromiseLogic.PromiseAll,
    logMe = false,
  } = {},
) => {
  const chunks = chunk(promiseArr, concurrent);

  let promiseChain;

  for (let index = 0; index <= chunks.length - 1; index++) {
    promiseChain = chainChunks(promiseChain, index, chunks, promiseLogic);

    promiseChain = chainCallback(promiseChain, index, chunks, callback);

    promiseChain = chainSleep(promiseChain, index, sleepMs);
  }
  logMe && console.log(promiseChainLog.join('\n\t'));
  return promiseChain;
};

exports = module.exports = { chunkPromise, PromiseLogic };
