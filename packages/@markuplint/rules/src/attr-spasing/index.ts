import { createRule, Result } from '@markuplint/ml-core';

export interface AttrSpasingOptions {
	lineBreak: 'either' | 'always' | 'never';
	width: number | false;
}

export default createRule<boolean, AttrSpasingOptions>({
	name: 'attr-spasing',
	defaultLevel: 'warning',
	defaultValue: true,
	defaultOptions: {
		lineBreak: 'either',
		width: 1,
	},
	async verify(document, messages) {
		const reports: Result[] = [];
		const message = messages('error');
		await document.walkOn('Element', async node => {
			const attrs = node.attributes;
			for (const attr of attrs) {
				const hasSpace = !!attr.beforeSpaces.raw;
				const hasLineBreak = /\r?\n/.test(attr.beforeSpaces.raw);
				// console.log({ attr: `${attr.beforeSpaces.raw}${attr.raw}`, hasSpace, hasLineBreak });
				if (!hasSpace) {
					reports.push({
						severity: node.rule.severity,
						message: messages('スペースが必要です'),
						line: attr.beforeSpaces.startLine,
						col: attr.beforeSpaces.startCol,
						raw: attr.beforeSpaces.raw,
					});
				} else {
					if (hasLineBreak) {
						if (node.rule.option.lineBreak === 'never') {
							reports.push({
								severity: node.rule.severity,
								message: messages('改行はしないでください'),
								line: attr.beforeSpaces.startLine,
								col: attr.beforeSpaces.startCol,
								raw: attr.beforeSpaces.raw,
							});
						}
					} else {
						if (node.rule.option.lineBreak === 'always') {
							reports.push({
								severity: node.rule.severity,
								message: messages('改行してください'),
								line: attr.beforeSpaces.startLine,
								col: attr.beforeSpaces.startCol,
								raw: attr.beforeSpaces.raw,
							});
						}
						if (node.rule.option.width && node.rule.option.width !== attr.beforeSpaces.raw.length) {
							reports.push({
								severity: node.rule.severity,
								message: messages('スペースは{0}つにしてください', node.rule.option.width),
								line: attr.beforeSpaces.startLine,
								col: attr.beforeSpaces.startCol,
								raw: attr.beforeSpaces.raw,
							});
						}
					}
				}
			}
		});
		return reports;
	},
	// async fix(document) {
	// 	await document.walkOn('Element', async node => {
	// 		const attrs = node.attributes;
	// 		for (const attr of attrs) {
	// 			const hasSpace = !!attr.beforeSpaces.raw;
	// 			const hasLineBreak = /\r?\n/.test(attr.beforeSpaces.raw);
	// 			// console.log({ attr: `${attr.beforeSpaces.raw}${attr.raw}`,  hasSpace, hasLineBreak });
	// 			const expectWidth = node.rule.option.width || 1;
	// 			const expectSpaces = ' '.repeat(expectWidth);
	// 			if (!hasSpace) {
	// 				attr.beforeSpaces.fix(expectSpaces);
	// 			} else {
	// 				if (hasLineBreak) {
	// 					if (node.rule.option.lineBreak === 'never') {
	// 						const fixed = attr.beforeSpaces.raw.replace(/\r?\n/g, '') || expectSpaces;
	// 						attr.beforeSpaces.fix(expectSpaces);
	// 					}
	// 				} else {
	// 					if (node.rule.option.lineBreak === 'always') {
	// 						const expectIndent = node.indentation ? node.indentation.raw : '';
	// 						attr.beforeSpaces.fix(`\n${expectIndent}`);
	// 					} else if (node.rule.option.width && node.rule.option.width !== attr.beforeSpaces.raw.length) {
	// 						attr.beforeSpaces.fix(expectSpaces);
	// 					}
	// 				}
	// 			}
	// 		}
	// 	});
	// },
});
