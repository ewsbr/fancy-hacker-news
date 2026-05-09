import { antfu } from '@antfu/eslint-config';

export default antfu(
  {
    stylistic: {
      semi: true,
    },
  },
  {
    ignores: [
      'test/fixtures/**',
    ],
  },
  {
    rules: {
      'toml/array-bracket-newline': 'off',
      'no-alert': 'off',
    },
    languageOptions: {
      globals: {
        chrome: 'readonly',
      },
    },
  },
);
