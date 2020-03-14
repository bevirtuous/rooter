module.exports = {
  coverageReporters: ['json', 'lcov', 'text'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'svelte'],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)spec)\\.(js|jsx)?$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  unmockedModulePathPatterns: [
    '<rootDir>/node_modules/react/',
    '<rootDir>/node_modules/enzyme/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,svelte}',
  ],
  setupFiles: [
    './testSetup.js',
  ],
  testURL: 'http://localhost/myroute/123',
  // transform: {
  //   '^.+\\.svelte$': 'svelte-jester',
  //   '^.+\\.(js,jsx)$': 'babel-jest',
  // },
};
