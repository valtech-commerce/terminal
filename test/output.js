//--------------------------------------------------------
//-- Tests - Output
//--------------------------------------------------------
'use strict';  // eslint-disable-line strict

const { terminal } = require('../dist/node');
const chalk        = require('chalk');
const emoji        = require('node-emoji');



terminal.setTheme({
	logo: '👨‍💻',
	textColor: '#ffff88',
	backgroundColor: '#008800',
	textOnBackgroundColor: '#ff8888',
	borderColor: '#ff88ff',
	language: terminal.language.francais,
	indent: 4,
	spinnerColor: terminal.basicColor.red,
	spinnerType: terminal.spinnerType.dots1
});


terminal.printGitStatus({
	modified: [],
	created: ['added1.md', 'added2.md'],
	renamed: [{ from: 'old.md', to: 'new.md' }],
	deleted: ['noooooo.md']
});

/*
terminal
	.titleBox('Hey')
	.startSpinner('xxxx')
;

setTimeout(() => {
	terminal
		.updateSpinnerText('yyyy')
	;
}, 1500);

setTimeout(() => {
	terminal
		.stopSpinner()
		.completionBox()
		.print('Test1')
	;
}, 3000);
*/

[
	`
				--
					1
						2
					⚗
					${chalk.underline('taratapouel')}
				--
	`,
	`${emoji.get('rainbow')}   Hey hey`,
	'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt'
].forEach((string) => {

	terminal.echo(string);
	terminal.echoIndent(string);
	terminal.print(string);

	terminal.confirmation(string);
	terminal.warning(string);
	terminal.error(string);
	terminal.success(string);
	terminal.failure(string);
	terminal.dontSudoMe();

	terminal.titleBox(string);
	terminal.infoBox(string);
	terminal.confirmationBox(string);
	terminal.warningBox(string);
	terminal.errorBox(string);
	terminal.borderedBox(string);

	setTimeout(() => {
		terminal.completionBox();
		terminal.titleBox('Test1');
	}, 1150);

	setTimeout(() => {
		terminal.completionBox();
		terminal.titleBox('Test2');
	}, 2000);

	setTimeout(() => {
		terminal.titleBox('Test3');
	}, 3000);

	setTimeout(() => {
		terminal.completionBox();
		terminal.completionBox();
	}, 3500);

});

