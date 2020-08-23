const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

module.exports = [
  // browser-friendly UMD build
	{
		input: 'build/index.js',
		output: {
			name: 'GPUjsRealRenderer',
			file: 'dist/gpujs-real-renderer-browser.js',
			format: 'umd'
		},
		plugins: [
			nodeResolve(),
			commonjs()
		]
	},
	// Minified Build
	{
		input: 'build/index.js',
		output: {
			name: 'GPUjsRealRenderer',
			file: 'dist/gpujs-real-renderer-browser.min.js',
			format: 'umd'
		},
		plugins: [
			nodeResolve(),
			commonjs(),
			terser()
		]
  }
]