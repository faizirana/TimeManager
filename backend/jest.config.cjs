// jestconfig.cjs
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ['js', 'json','cjs'],
  transformIgnorePatterns: [
    'node_modules/(?!module-to-transform)'
  ]
};
