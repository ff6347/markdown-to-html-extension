/**
 * ESLint configuration for the project.
 *
 * See https://eslint.style and https://typescript-eslint.io for additional linting options.
 */
// @ts-check
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
	{
		ignores: ['dist', 'out', 'esbuild.js'],
	},
	{
		files: ['**/*.ts'],
		plugins: {
			'@typescript-eslint': typescriptEslint,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: true,
			},
			ecmaVersion: 2022,
			sourceType: 'module',
		},
		rules: {
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: 'import',
					format: ['camelCase', 'PascalCase'],
				},
			],
			curly: 'warn',
			eqeqeq: 'warn',
			'no-throw-literal': 'warn',
			semi: ['warn', 'always'],
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
];
