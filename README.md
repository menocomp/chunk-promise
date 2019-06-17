# PromiseAll

promiseAll is a tiny library used to run a list of native promises in chunks.

You may decide how many concurrent promises to run in parallel.

## How to use

```
npm install promiseall
```

## Examples

Let consider you have an array of promises like below:

```
const promiseArr = Array.from([1, 2, 3, 4, 5, 6, 7], x => Promise.resolve(x));
```

And you do not want to run them all at once but rather you want to run them in chunks.

Currently, the native `Promise.all` would run them all in parallel. However this might not be the thing you want to do. Some might consider using a libraray like BlueBird to achieve that.

Or....

You can use this library :)

```
const { promiseAll } = require("promiseall");

promiseAll(promiseArr, { concurrent: 2 });
```

PromiseAll also accpet extra params other than `concurrent` like: 

`sleep` => this will cause a sleep after every chunk is processed.

`callback` => this will call a callback function (if specified) after every chunk is processed.
