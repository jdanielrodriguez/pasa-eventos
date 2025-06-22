export default {
  displayName: 'api',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/api',
  setupFilesAfterEnv: ['<rootDir>/../tests/api/setup.ts'],
  testMatch: [
    '<rootDir>/../tests/api/unit/**/*.test.ts',
    '<rootDir>/../tests/api/integration/**/*.test.ts'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,ts}',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/app.ts'
  ],
};
