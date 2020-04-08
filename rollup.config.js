const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

module.exports = [
  // browser-friendly UMD build
	{
		input: 'index.js',
		output: {
			name: 'GPUjsRealRenderer',
			file: 'dist/gpujs-real-renderer-browser.js',
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs()
		]
	},
	// Minified Build
	{
		input: 'index.js',
		output: {
			name: 'GPUjsRealRenderer',
			file: 'dist/gpujs-real-renderer-browser.min.js',
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs(),
			terser()
		]
  }
]