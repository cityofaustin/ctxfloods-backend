// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testEnvironment: "node",
  globalSetup: './src/setup.js',
  globalTeardown: './src/teardown.js'
};