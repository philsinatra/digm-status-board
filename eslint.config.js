import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

const gitignore_path = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignore_path),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: {
			import: importPlugin
		},
		files: ['**/*.{js,ts,svelte}'],
		rules: {
			'no-undef': 'off',
			camelcase: 'off',
			'svelte/no-inspect': 'off',
			'import/order': [
				'error',
				{
					groups: [
						'builtin', // Node.js built-in modules
						'external', // Installed packages
						'internal', // Path aliases
						'parent', // Parent directories
						'sibling', // Same directory
						'index', // Index of same directory
						'object', // Object-imports
						'type' // Type-only imports
					],
					pathGroups: [
						{
							pattern: '$app/**',
							group: 'external',
							position: 'before'
						},
						{
							pattern: '@/**',
							group: 'internal',
							position: 'after'
						}
					],
					pathGroupsExcludedImportTypes: ['builtin'],
					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					},
					'newlines-between': 'never'
				}
			],
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: ['variable', 'function'],
					format: null,
					custom: {
						regex: '^(GET|POST|PUT|UPDATE|DELETE|[a-z][a-z0-9]*(_[a-z0-9]+)*)$',
						match: true
					}
				},
				{
					selector: ['parameter'],
					format: null,
					custom: {
						regex: '^[a-z][a-z0-9]*(_[a-z0-9]+)*$',
						match: true
					},
					filter: {
						regex: '^(?!set_headers|setHeaders|event|request|response).*$',
						match: true
					}
				},
				{
					selector: 'class',
					format: ['PascalCase']
				},
				{
					selector: 'variable',
					modifiers: ['const'],
					format: null,
					custom: {
						regex: '^([A-Z][A-Z0-9]*(_[A-Z0-9]+)*|[a-z][a-z0-9]*(_[a-z0-9]+)*)$',
						match: true
					}
				}
			]
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelte.parser,
			parserOptions: {
				parser: ts.parser,
				project: true,
				extraFileExtensions: ['.svelte'],
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.js', '**/*.ts'],
		rules: {
			'import/order': [
				'error',
				{
					// Same config as above
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
						'object',
						'type'
					],
					pathGroups: [
						{
							pattern: '$app/**',
							group: 'external',
							position: 'before'
						},
						{
							pattern: '@/**',
							group: 'internal',
							position: 'after'
						}
					],
					pathGroupsExcludedImportTypes: ['builtin'],
					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					},
					'newlines-between': 'always'
				}
			]
		}
	}
);
