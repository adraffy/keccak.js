import {terser} from 'rollup-plugin-terser';

export default {
	input: './keccak.js',
	output: [
		{
			file: './dist/keccak.min.js',
			format: 'es',
			plugins: [terser()]
		}
	]
};