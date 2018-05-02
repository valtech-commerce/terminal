//--------------------------------------------------------
//-- Tests
//--------------------------------------------------------
'use strict';

const tester = require('@absolunet/tester');

tester.lintJs();


// const terminal = require('../index');
// const chalk = require('chalk');
//
// terminal.setDefault('🦊', 'blue', 'fr');
//
// [
// 	`
// 				--
// 					1
// 						2
// 					⚗
// 					${chalk.underline('taratapouel')}
// 				--
// 	`
// ].forEach((str) => {
// 	terminal.echo(str);
// 	terminal.print(str);
// 	terminal.warning(str);
// 	terminal.error(str);
// 	terminal.success(str);
// 	terminal.failure(str);
// 	terminal.dontSudoMe();
//
// 	terminal.titleBox('Hello');
// 	terminal.titleBox(str);
// 	terminal.warningBox(str);
// 	terminal.errorBox(str);
//
//
//	setTimeout(() => {
//		terminal.completionBox();
//		terminal.titleBox('Test1');
//	}, 1150);
//
//	setTimeout(() => {
//		terminal.completionBox();
//		terminal.titleBox('Test2');
//	}, 2000);
//
//	setTimeout(() => {
//		terminal.titleBox('Test3');
//	}, 3000);
//
//	setTimeout(() => {
//		terminal.completionBox();
//		terminal.completionBox();
//	}, 3500);
// });
