const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

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
	}
]