/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
module.exports = {
	env: { es6: true },
	root: true,
	extends: ['./node_modules/@zextras/carbonio-ui-configs/rules/eslint.js'],
	plugins: ['eslint-plugin-notice'],
	rules: {
		'notice/notice': [
			'error',
			{
				templateFile: './notice.template.ts'
			}
		],
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off'
	},
	ignorePatterns: ['notice.template.ts'],
	parserOptions: {
		sourceType: 'module'
	}
};
