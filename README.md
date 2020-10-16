# chunk-promise

chunk-promise is a tiny library that can be used to run a list of native promises in chunks/patches by creating a promise chain with some optional customization that gives you full control over these promises.

It supports running both `Promise.all` and `Promise.allSettled` flavors in chunks.
It can be used to run `Promise.allSettled` in browsers that do not support it.
It can be combined with `async/await`.

_What is `Promise.allSettled`? [see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)_

## Why new library?

Yes, there are lots of libraries that give you some control over promises.

[bluebird](https://github.com/petkaantonov/bluebird): This library does not use native promises, it is using its own version of promises.

[p-limit](https://github.com/sindresorhus/p-limit): It does use native promises but it neither support `Promise.allSettled` nor callbacks between chunks.

## Aren't native promises enough?

Well, it depends in your situation. If you want to use either native promises or async/await they are definitely doing great however both `Promise.all` and `Promise.allSettled` would run all functions in parallel with no control over how many promises to run in patches. they do not support running promises in chunks. You simply have a list of promises that run all in parallel.

## Why should I use this library?

- If you want to run promises in chunks with both `Promise.all` and `Promise.allSettled` flavors where every single chunk runs (n) number of promises in parallel.

- If you want to slow down the execution by introducing sleep/timeout function between chunks.

- If you want to call a custom function after every single chunk.

- If you want to force stop the promises execution for some reason in the middle.

- If you want to use `Promise.allSettled` in browsers that do not support it, or in Node (only supported natively in Node starting from version 12)

All of these functionality are packed inside one small yet powerful library.

## How to use

```
npm install chunk-promise
```

## Available promise customizations

| Option            | Required? | Description                                                                                                                                                                                                                                  | Default value |
| ----------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **concurrent**    | No        | Number of concurrent promises to run in a single chunk                                                                                                                                                                                       | Infinity      |
| **sleepMs**       | No        | Sleep function in milliseconds between chunks                                                                                                                                                                                                | undefined     |
| **callback**      | No        | Callback async function to be called after every single chunk. <br>It exposes 3 params:<br> - `chunkResults`: the current chunk value. <br> - `chunkIndex`: the current chunk index.<br> - `allResults`: the results of the promises so far. | undefined     |
| **promiseFlavor** | No        | Choose between `Promise.all` and `Promise.allSettled`                                                                                                                                                                                        | Promise.all   |
| **logMe**         | No        | Log what will be running                                                                                                                                                                                                                     | false         |

## Examples

### 1. Run list of promises in chunks using `Promise.all`

```javascript
const { chunkPromise, PromiseFlavor } = require('chunk-promise');

const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll
})
  .then(res => {})
  .catch(err => {});
```

### 2. Run list of promises in chunks using `Promise.allSettled`

```javascript
const { chunkPromise, PromiseFlavor } = require('chunk-promise');

const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAllSettled
}).then(res => {});
```

### 3. Run list of promises in chunks using `Promise.all` and slow down by sleeping for 2 seconds between chunks.

```javascript
const { chunkPromise, PromiseFlavor } = require('chunk-promise');

const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll,
  sleepMs: 2000
})
  .then(res => {})
  .catch(err => {});
```

### 4. Run list of promises in chunks using `Promise.allSettled` and run a callback function after every chunk.

```javascript
const { chunkPromise, PromiseFlavor } = require('chunk-promise');

const promiseArr = [
  () => Promise.reject(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAllSettled,
  callback: async (chunkResults, index, allResults) => {
    if (chunkResults.some(p => p.status === 'fulfilled')) {
      console.log(`chunk (${index}): has success results`);
    } else {
      console.log(`chunk (${index}): has no success results`);
    }
  }
}).then(res => {});
```

### 5. Run list of promises in chunks using `Promise.all` and run a callback function after every chunk and force stop the promise chain.

```javascript
const {
  chunkPromise,
  PromiseFlavor,
  ChunkPromiseCallbackForceStopError
} = require('chunk-promise');

const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => Promise.resolve(3),
  () => Promise.resolve(4),
  () => Promise.resolve(5)
];

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll,
  callback: async (chunkResults, index, allResults) => {
    console.log(`chunk (${index}): has success results`);
    if (index === 1) {
      throw new ChunkPromiseCallbackForceStopError(
        `Callback force stop at chunk index ${index}`
      );
    }
  }
})
  .then(res => {})
  .catch(err => {
    if (err instanceof ChunkPromiseCallbackForceStopError) {
      console.log('Force stop');
    } else {
      console.log('failed');
    }
  });
```

## Any suggestions?

Please do not hesitate to report any issue/improvement if you want to add more options/customizations to this library.
