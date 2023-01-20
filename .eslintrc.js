module.exports = {

  extends: ['airbnb'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
        amd: true,
      },
      extends: ['plugin:import/typescript', 'plugin:react/recommended', 'airbnb-typescript'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['*/tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['react', '@typescript-eslint'],
      rules: {
        'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
        // https://github.com/import-js/eslint-plugin-import/issues/1913
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
