module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'simple-import-sort'],
  rules: {
    'prettier/prettier': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'no-console': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': [
      'warn',
      { max: 80, skipBlankLines: true, skipComments: true, IIFEs: true },
    ],
    'max-depth': ['warn', 4],
    'max-params': ['warn', 4],
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/'],
};
