module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 0,
    'no-console': 0,
    'max-classes-per-file': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'class-methods-use-this': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    'no-nested-ternary': 0,
    'no-bitwise': 0,
  },
};
