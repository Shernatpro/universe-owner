const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  'react': path.resolve(__dirname, 'node_modules/react'),
};

config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('mjs');
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

module.exports = config;