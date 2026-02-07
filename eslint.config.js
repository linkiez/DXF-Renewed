import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      'test/**/*',
      'lib/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '*.config.js',
      '*.config.cjs',
      'build.mjs',
      'examples/**/*'
    ]
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.recommended,

  // CommonJS files configuration
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        URL: 'readonly',
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },

  // Custom rules for JS/TS modules
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        URL: 'readonly',

        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',

        // ES6+ globals
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',

        // Test globals
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-lone-blocks': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },

  // Prettier config (must be last to override other configs)
  eslintConfigPrettier
]
