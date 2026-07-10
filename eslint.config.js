import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Flat ESLint config. Strict TypeScript + React-hooks correctness across the
 * app; Node globals for the server and test suites. Build output and config
 * files are ignored.
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-server/**',
      'coverage/**',
      'node_modules/**',
      'public/**',
      'dev/**',
      '**/*.config.{js,ts}',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Browser app source
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // Server + tests run under Node
  {
    files: ['server/**/*.ts', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Test stubs sometimes use generator functions as no-op async iterators.
      'require-yield': 'off',
    },
  },
);
