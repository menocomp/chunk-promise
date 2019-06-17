const { chunkPromise } = require("..");

const promiseArr = Array.from([1, 2, 3, 4, 5, 6, 7], x => Promise.resolve(x));

(async () => {
  const callback = async (x) => {
    console.log("hello", x);
  };

  return chunkPromise(promiseArr, { concurrent: 2, sleep: 2000, callback }).then(
    result => {
      console.log(result);
    }
  );
})();
