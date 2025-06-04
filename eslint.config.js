import { fileURLToPath } from 'node:url';
import globals from 'globals';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';
import ts from 'typescript-eslint';

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
		rules: {
			'no-undef': 'off',
			camelcase: 'off',
			'svelte/no-inspect': 'off',
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
	}
);
