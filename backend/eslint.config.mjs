import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**", "uploads/**"],
    },
    {
        rules: {
            // Established error-handling convention (`catch (error: any)`) — kept
            // as a warning rather than banned outright, since Express's
            // catch-all error shape isn't narrowly typeable without a large,
            // unrelated refactor.
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            // `declare global { namespace Express { ... } }` is the standard way
            // to augment Express's Request type — allow namespaces in `declare` contexts.
            "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
        },
    },
    {
        files: ["jest.config.js"],
        languageOptions: {
            globals: { module: "writable", require: "readonly" },
        },
    }
);
