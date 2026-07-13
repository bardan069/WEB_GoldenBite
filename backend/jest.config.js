/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
        "^.+\\.js$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
    },
    // uuid v14+ ships as pure ESM; allow Jest to transform it
    transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    forceExit: true,
    detectOpenHandles: true,
};
