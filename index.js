// This is a workaround for: https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

const dotProp = require('dot-prop');
const findUp = require('find-up');
const semver = require('semver');

const base = require('./src/base');
const jsxA11y = require('./src/jsx-a11y');
const node = require('./src/node');
const next = require('./src/next');
const prettier = require('./src/prettier');
const react = require('./src/react');
const reactHooks = require('./src/react-hooks');
const { checkIfHasPackage } = require('./utils');

const usesBabelConfig = findUp.sync([
  '.babelrc',
  '.babelrc.json',
  'babel.config.json',
]);
const usesNext = checkIfHasPackage('next');
const usesReact = checkIfHasPackage('react');
const usesReactNative = checkIfHasPackage('react-native');
const reactVersion = usesReact ? semver.coerce(usesReact).version : undefined;

const config = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    'shared-node-browser': true,
  },
  extends: ['airbnb', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    ecmaVersion: 2021,
    requireConfigFile: false,
    sourceType: 'module',
  },
  plugins: ['node', 'prettier'],
  reportUnusedDisableDirectives: true,
  rules: {
    ...base,
    ...node,
    ...prettier,
  },
};

if (usesReact) {
  dotProp.set(config, 'parserOptions.ecmaFeatures.jsx', true);
  dotProp.set(config, 'settings.react.version', 'detect');
  config.plugins.push('react');
  config.rules = {
    ...config.rules,
    ...react,
  };

  if (semver.gte(reactVersion, '16.8.0')) {
    config.plugins.push('react-hooks');
    config.rules = {
      ...config.rules,
      ...reactHooks,
    };
  }

  if (usesReactNative) {
    dotProp.set(config, 'env.react-native/react-native', true);
    config.plugins.push('react-native');
    config.rules = {
      ...config.rules,
    };
  } else {
    config.plugins.push('jsx-a11y');
    config.rules = {
      ...config.rules,
      ...jsxA11y,
    };
  }
}

if (usesBabelConfig) {
  dotProp.set(config, 'parserOptions.babelOptions.configFile', usesBabelConfig);
  dotProp.set(config, 'parserOptions.requireConfigFile', true);
} else if (usesNext) {
  dotProp.set(config, 'parserOptions.babelOptions.presets', ['next/babel']);
} else if (usesReact) {
  dotProp.set(config, 'parserOptions.babelOptions.presets', [
    '@babel/preset-react',
  ]);
}

if (usesNext) {
  config.rules = {
    ...config.rules,
    ...next,
  };
}

module.exports = config;
