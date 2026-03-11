module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    clearMocks: true,
    // Run suites serially — all tests share one Postgres DB so parallel
    // execution causes foreign-key violations and count mismatches.
    runInBand: true,
};
