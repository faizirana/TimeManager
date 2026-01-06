// jestconfig.cjs
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["js", "json", "cjs"],
  transformIgnorePatterns: ["node_modules/(?!module-to-transform)"],
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
