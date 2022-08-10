module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(spec|test)\\.ts$',
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
  collectCoverage: true,
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/$1',
  },
};
