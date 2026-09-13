const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Metro doesn't recognize .onnx as a bundleable asset by default (unlike
// .ttf/.png) — without this, `require('../assets/models/*.onnx')` fails to
// resolve.
config.resolver.assetExts.push('onnx');

module.exports = withNativeWind(config, { input: './global.css' });
