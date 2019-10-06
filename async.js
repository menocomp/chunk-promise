const sleep = (ms) => (res) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(res), ms);
  });

const reflect = (promise) =>
  promise
    .then((value) => ({ status: 'fulfilled', value }))
    .catch((reason) => ({ status: 'rejected', reason }));

exports = module.exports = { sleep, reflect };
