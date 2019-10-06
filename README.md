# chunk-promise

chunk-promise is a tiny library used to run a list of native promises in chunks.

It supports running both `Promise.all` and `Promise.allSettled` flavors in chunks.

_What is `Promise.allSettled`? [see here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)_

## Why new library?

Yes, there are lots of libraries that give you some control over promises.

[blubird](https://github.com/petkaantonov/bluebird): This library does not use native promises, it is using its own version of promises.

[p-limit](https://github.com/sindresorhus/p-limit): It does use native promises but does not support `Promise.allSettled`

## Aren't native promises enough?

Well, it depends. native promises and async/await are definitely doing great however both `Promise.all` and `Promise.allSettled` would run all functions in parallel with no control over how many to run in patches. they do not support running promises in chunks. You simply have a list of promises that run all in parallel.

## Why should I use this library?

- If you want to run promises in chunks with both `Promise.all` and `Promise.allSettled` flavors where every single chunk runs (n) number of promises in parallel.

- If you want to slow down the execution by introducing sleep/timeout function between chunks.

- If you want to receive a notification after every single chunk.

- If you want to force stop the promises execution for some reason.

All of these functionality are packed inside one small yet powerful library.

## How to use

```
npm install chunk-promise
```

## Available promise customizations
| Option        | Required? | Description| Default value |
| ------------- |-------------|-----------|-|
| **concurrent**| No |Number of concurrent promises to run in a single chunk | Infinity
| **sleepMs**      |  No | Sleep function between chunks in milliseconds | undefined
| **callback** | No | callback to be called after every single chunk      | undefined
| **promiseFlavor** | No  | choose between Promise.all and Promise.allSettled | Promise.all
| **logMe** | No | log what will be running | false

## Examples

### 1. Run list of promises in chunks using `Promise.all`

```javascript
const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

const { chunkPromise } = require('chunk-promise');

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll
});
```

### 2. Run list of promises in chunks using `Promise.allSettled`

```javascript
const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

const { chunkPromise } = require('chunk-promise');

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAllSettled
});
```

### 3. Run list of promises in chunks using `Promise.all` and slow down by sleeping for 2 seconds between chunks.

```javascript
const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

const { chunkPromise } = require('chunk-promise');

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll,
  sleepMs: 2000
});
```

### 4. Run list of promises in chunks using `Promise.allSettled` and run a callback function after every chunk.

```javascript
const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

const { chunkPromise } = require('chunk-promise');

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll,
  callback: (chunkResults, index, allResults) => {
    if (chunkResults.some(p => p.status === 'fulfilled')) {
      console.log(`chunk (${index}): has success results`);
    } else {
      console.log(`chunk (${index}): has no success results`);
    }
  }
});
```

### 5. Run list of promises in chunks using `Promise.allSettled` and run a callback function after every chunk.

```javascript
const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

const { chunkPromise } = require('chunk-promise');

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll,
  callback: (chunkResults, index, allResults) => {
    if (chunkResults.some(p => p.status === 'fulfilled')) {
      console.log(`chunk (${index}): has success results`);
    } else {
      console.log(`chunk (${index}): has no success results`);
    }
  }
});
```

### 6. Run list of promises in chunks using `Promise.allSettled` and run a callback function after every chunk to force stop the promise chain.

```javascript
const promiseArr = [
  () => Promise.resolve(1),
  () => Promise.reject(2),
  () => Promise.resolve(3),
  () => Promise.reject(4),
  () => Promise.resolve(5)
];

const { chunkPromise } = require('chunk-promise');

chunkPromise(promiseArr, {
  concurrent: 2,
  promiseFlavor: PromiseFlavor.PromiseAll,
  callback: (chunkResults, index, allResults) => {
    console.log(`chunk (${index}): has success results`);
    if (index === 1) {
      throw new ChunkPromiseCallbackForceStopError(
        `Callback force stop at chunk index ${index}`
      );
    }
  }
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
```
## Any suggestions?
Please do not hesitate to report any issue/improvement if you want to add more options/customizations to this library.