import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';

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
		input: './src/index.js',
		plugins: [NODE],
		output: [
			{
				file: './dist/index.js',
				format: 'es'
			},
			{
				file: './dist/index.min.js',
				format: 'es',
				plugins: [TERSER]
			},
			{
				file: './dist/index.cjs',
				format: 'cjs',
			}
		]
	},
	{
		input: './src/keccak256.js',
		plugins: [NODE],
		output: [
			{
				file: './dist/keccak256.js',
				format: 'es'
			},
			{
				file: './dist/keccak256.min.js',
				format: 'es',
				plugins: [TERSER]
			},
			{
				file: './dist/keccak256.cjs',
				format: 'cjs',
			}
		]
	},
];
