//--------------------------------------------------------
//-- Tests - Output
//--------------------------------------------------------
'use strict';

const { terminal } = require('..');
const chalk = require('chalk');
const emoji = require('node-emoji');

terminal.setDefaults({
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
].forEach((string) => {
	terminal.echo(string);
	terminal.print(string);
	terminal.warning(string);
	terminal.error(string);
	terminal.success(string);
	terminal.failure(string);
	terminal.dontSudoMe();
	terminal.borderedBox('Hello');
	terminal.borderedBox(string);
	terminal.titleBox('Hello');
	terminal.titleBox(string);
	terminal.warningBox(string);
	terminal.errorBox(string);

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
