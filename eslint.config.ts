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
      'antfu/if-newline': 'off',
      'curly': ['error', 'multi-line'],
      'style/brace-style': ['error', '1tbs'],
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
