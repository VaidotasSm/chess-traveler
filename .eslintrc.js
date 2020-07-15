module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['airbnb-base', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'max-len': ['error', { code: 120 }],
    'object-curly-newline': 0,
    'no-use-before-define': 0,
    'lines-between-class-members': 0,
    'comma-dangle': 0,
    'no-plusplus': 0,
  },
};
