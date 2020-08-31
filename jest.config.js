module.exports = {
  coverageReporters: ['json', 'lcov', 'text'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'svelte'],
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)spec)\\.(js|jsx)?$',
  testPathIgnorePatterns: [
    '/coverage/',
    '/node_modules/',
  ],
  transformIgnorePatterns: [
    '/node_modules\\/(?!history)(.*)',
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
};
