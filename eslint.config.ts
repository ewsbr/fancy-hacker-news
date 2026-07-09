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
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
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
