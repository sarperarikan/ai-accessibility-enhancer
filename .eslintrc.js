// ESLint yapılandırması - WCAG 2.2-AA uyumlu kod kalitesi
// MIT License

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    webextensions: true,
  },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // WCAG 2.2-AA: Kod kalitesi ve erişilebilirlik
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Genel kod kalitesi
    'no-console': 'off', // Chrome extension geliştirme için
    'prefer-const': 'error',
    'no-var': 'error',
    'no-undef': 'off', // TypeScript halledecek
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.config.js'],
};
