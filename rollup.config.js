import {terser} from 'rollup-plugin-terser';
import {nodeResolve} from '@rollup/plugin-node-resolve';

const TERSER = terser({
	compress: {
		toplevel: true,
		passes: 2, 
		dead_code: true
	}
});

const NODE = nodeResolve();

export default [
	{
		input: './src/lib.js',
		plugins: [NODE],
		output: [
			{
				file: './dist/keccak.js',
				format: 'es'
			}
		]
	},
	{
		input: './src/lib.js',
		plugins: [NODE],
		output: [
			{
				file: './dist/keccak.min.js',
				format: 'es',
				plugins: [TERSER]
			}
		]
	},
	{
		input: './src/mini.js',
		plugins: [NODE],
		output: [
			{
				file: './dist/keccak256.min.js',
				format: 'es',
				plugins: [TERSER]
			}
		]
	},
];