//--------------------------------------------------------
//-- Tests
//--------------------------------------------------------
'use strict';

const tester = require('@absolunet/tester');

tester.npmPackage.validate();

/*
const terminal = require('../index');
const chalk = require('chalk');
const emoji = require('node-emoji');

terminal.setDefault({
	logo: '🦊',
	color: 'blue',
	lang: 'fr'
});
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
].forEach((str) => {
	terminal.echo(str);
	terminal.print(str);
	terminal.warning(str);
	terminal.error(str);
	terminal.success(str);
	terminal.failure(str);
	terminal.dontSudoMe();
	terminal.titleBox('Hello');
	terminal.titleBox(str);
	terminal.warningBox(str);
	terminal.errorBox(str);
	terminal.infoBox(str);

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
*/
