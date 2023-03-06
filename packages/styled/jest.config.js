/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!lodash-es)"
  ]
};