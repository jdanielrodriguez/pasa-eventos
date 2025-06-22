export default {
  displayName: 'api',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/api',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: [
    '<rootDir>/src/test/unit/**/*.test.ts',
    '<rootDir>/src/test/integration/**/*.test.ts'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,ts}',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/app.ts'
  ],
};
