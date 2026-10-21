import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import i18next from 'eslint-plugin-i18next';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/**/*.tsx'],
    ignores: [
      'src/locales/**',
      'src/i18n/**',
      'src/lib/**',
      'src/config/**',
      'src/data/**',
    ],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          framework: 'react',
          mode: 'jsx-only',
          'jsx-attributes': {
            exclude: [
              '^className$',
              '^class$',
              '^key$',
              '^id$',
              '^htmlFor$',
              '^href$',
              '^src$',
              '^srcSet$',
              '^sizes$',
              '^type$',
              '^target$',
              '^rel$',
              '^loading$',
              '^crossOrigin$',
              '^style$',
              '^as$',
              '^ratio$',
              '^value$',
              '^name$',
              '^role$',
              '^data-.*',
              '^aria-hidden$',
              '^xmlns$',
              '^viewBox$',
              '^d$',
              '^fill$',
              '^stroke.*',
              '^cx$',
              '^cy$',
              '^r$',
              '^width$',
              '^height$',
            ],
          },
          words: {
            exclude: ['^[\\s\\d.,:;|/·•–—()+\\-*#@%]*$', '^\\s*$'],
          },
          callees: {
            exclude: [
              '^t$',
              '^tm$',
              '^useI18n$',
              '^formatDate$',
              '^formatNumber$',
              '^navigate$',
              '^link$',
              '^pathFor$',
              '^photo$',
              '^photoSet$',
              '^require$',
              '^import$',
              '^addEventListener$',
              '^removeEventListener$',
              '^matchMedia$',
              '^querySelector.*',
              '^closest$',
              '^getItem$',
              '^setItem$',
              '^Error$',
            ],
          },
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/locales/**',
      'src/i18n/**',
      'src/lib/**',
      'src/config/**',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/[\\u0600-\\u06FF]/]',
          message: 'Arabic text must live in src/locales/*.json',
        },
        {
          selector: 'TemplateElement[value.raw=/[\\u0600-\\u06FF]/]',
          message: 'Arabic text must live in src/locales/*.json',
        },
      ],
    },
  }
);
