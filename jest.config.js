module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
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
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/babel.config.js',
    '!**/.eslintrc.js',
    '!**/jest.config.js',
    '!**/rollup.config.js',
  ],
  setupFiles: [
    './testSetup.js',
  ],
  testURL: 'http://localhost/myroute/123',
};
