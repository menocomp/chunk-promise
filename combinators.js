const identity = (f) => f();

const compose = (f) => (g) => (x) => f(g(x));

exports = module.exports = { identity, compose };
