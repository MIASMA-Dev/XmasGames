module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        strict: false,
        noImplicitAny: false,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        downlevelIteration: true,
        types: ['jest', 'node'],
      }
    }],
  },
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};