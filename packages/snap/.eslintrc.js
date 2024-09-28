module.exports = {
  root: true,
  extends: ['../../.eslintrc.js'],
  overrides: [
    {
      files: ['tests/**/*.ts','tests/**/*.tsx'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: { 'jest/prefer-expect-assertions': 'off' },
      env: { jest: true },
    },
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "extends": ["@metamask/eslint-config-typescript"],
      "rules": {
        // This allows importing the `Text` JSX component.
        "@typescript-eslint/no-shadow": [
          "error",
          {
            "allow": ["Text"],
          },
        ],
      },
    }
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.eslint.json',
    sourceType: 'module',
  },
  ignorePatterns: ['./post-process.js'],
};
