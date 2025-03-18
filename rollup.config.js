import terser from '@rollup/plugin-terser';

export default [{
	input: 'tempo.js',
	output: [{
		file: 'tempo.cjs',
		format: 'cjs',
	}, {
		file: 'tempo.min.js',
		format: 'esm',
		plugins: [terser()],
		sourcemap: true,
	}],
}];
