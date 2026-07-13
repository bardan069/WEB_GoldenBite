/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    testMatch: ["**/__tests__/**/*.test.tsx", "**/__tests__/**/*.test.ts"],
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
    },
    transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};
