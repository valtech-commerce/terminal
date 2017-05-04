//--------------------------------------------------------
//-- Terminal utilities
//--------------------------------------------------------
'use strict';

const echo = console.log;  // eslint-disable-line no-console

const chalk  = require('chalk');
const emoji  = require('node-emoji');
const ora    = require('ora');
const redent = require('redent');
const pad    = require('@absolunet/terminal-pad');

const { spawnSync, execSync, exec } = require('child_process');






//-- Static properties
const STATIC = global.___AbsolunetTerminal___ ? global.___AbsolunetTerminal___ : global.___AbsolunetTerminal___ = {
	lang:        'en',
	logo:        '?',
	colorName:   'blue',
	color:        chalk.blue,
	bgcolor:      chalk.white.bgBlue,
	spinnerType: 'dots3',
	scripts:     {
		path:   '.',
		titles: {}
	}
};



const DICTIONARY = {
	sudo: {
		fr: 'Ça sert à rien de me forcer avec un sudo',
		en: 'It is useless to force me with a sudo'
	},
	complete: {
		fr: 'Complété',
		en: 'Complete'
	}
};

const trans = (key) => {
	return DICTIONARY[key][STATIC.lang];
};

const cleanUp = (text = '') => {
	return redent(text, 2).replace(/\t/g, '  ');
};

const box = (text, style, padding = true) => {
	let content = cleanUp(text).replace(/^\n+/g, '').replace(/\n+\s*$/g, '');
	content = padding ? `\n${content}\n` : content;

	echo('\n');
	content.split('\n').forEach((line) => {
		echo(style(pad(line, 80)));
	});
	echo('\n');
};






module.exports = class Cli {

	static setDefault({ logo = '?', color = 'blue', lang = 'en', spinnerType = 'dots3' }) {
		STATIC.logo        = logo;
		STATIC.colorName   = color;
		STATIC.color       = chalk[color];
		STATIC.bgcolor     = chalk.white[`bg${color.charAt(0).toUpperCase()}${color.slice(1)}`];
		STATIC.lang        = lang;
		STATIC.spinnerType = spinnerType;
	}

	static setScriptsFiles(path, titles) {
		STATIC.scripts.path   = path;
		STATIC.scripts.titles = titles;
	}






	static exit(text) {
		if (text) {
			this.errorBox(text);
		}

		process.exit(2); // eslint-disable-line no-process-exit
	}

	static echo(str) {
		echo(str);
	}

	static echoIndent(str) {
		echo(cleanUp(str));
	}

	static print(str) {
		echo(STATIC.color(cleanUp(str)));
	}

	static println(str) {
		this.print(`${str}\n`);
	}

	static spacer(nb = 1) {
		this.print('\n'.repeat(nb - 1));
	}

	static warning(text, newline = true) {
		echo(chalk.yellow(cleanUp(`${text}${newline ? '\n' : ''}`)));
	}

	static error(text) {
		echo(chalk.red(cleanUp(`\n${text}\n`)));
	}

	static success(str) {
		echo(chalk.green(cleanUp(`✓  ${str}\n`)));
	}

	static failure(str) {
		echo(chalk.red(cleanUp(`✘  ${str}\n`)));
	}

	static dontSudoMe() {
		this.errorBox(`${trans('sudo')} ${emoji.get('cry')}`);
	}

	static printState(options) {
		const { state, name, value, msg } = options;
		const mark     = state ? '✓' : '✘';
		const color    = state ? chalk.green : chalk.red;
		const errorMsg = state ? '' : msg;

		this.echoIndent(`${chalk.bold(`${name}`)}  ${color(`${mark}  ${value} ${errorMsg}`)}`);
	}

	static printStatus(status) {
		const colors = {
			not_added: 'green', // eslint-disable-line camelcase
			created:   'green',
			modified:  'yellow',
			renamed:   'yellow',
			deleted:   'red'
		};

		this.spacer(2);

		['not_added', 'created', 'modified', 'renamed', 'deleted'].forEach((type) => {
			if (status[type].length) {
				status[type].forEach((file) => {
					echo(cleanUp(`${chalk[colors[type]](pad(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`));
				});
			}
		});

		this.spacer(2);
	}






	static titleBox(text) {
		box(`
			${chalk.bgBlack('        ')}
			${chalk.bgBlack(`   ${STATIC.logo}    `)}  ${text}
			${chalk.bgBlack('        ')}
		`, STATIC.bgcolor);
	}

	static infoBox(text) {
		box(text, STATIC.bgcolor);
	}

	static warningBox(text) {
		box(text, chalk.bgYellow.black);
	}

	static errorBox(text) {
		box(text, chalk.bgRed.white);
	}

	static completionBox() {
		box(`${chalk.green('✓')}  ${trans('complete')}`, STATIC.bgcolor);
		this.spacer(2);
	}






	static startSpinner(text) {
		return ora({
			text:    text,
			spinner: STATIC.spinnerType,
			color:   STATIC.colorName
		}).start();
	}






	static run(cmd) {
		execSync(cmd, { stdio:'inherit' });
	}

	static runPromise(cmd, options = {}) {
		const mysqlWarning = /Warning: Using a password on the command line interface can be insecure\./g;

		return new Promise((resolve) => {
			exec(cmd, { stdio:'inherit' }, (error, stdout, stderr) => {

				let errorMsg = error ? error.toString() : '';
				let errorOuput = stderr;

				if (options.ignoreMySQLPasswordWarning) {
					errorMsg  = errorMsg.replace(mysqlWarning, '');
					errorOuput = stderr.replace(mysqlWarning, '');
				}

				if (errorMsg.trim() || errorOuput.trim()) {

					this.error(`
						${errorMsg || ''}
						${stdout || ''}
						${errorOuput || ''}
					`);
					this.exit();
				}

				resolve({ error, stdout, stderr });
			});
		});
	}

	static runAndRead(cmd) {
		return execSync(cmd, { encoding:'utf8' });
	}

	static runAndGet(cmd) {
		const lines = [];

		this.runAndRead(cmd).split(`\n`).forEach((line) => {
			if (line) {
				lines.push(line);
			}
		});

		return lines.join(' / ');
	}

	static runAndEcho(cmd) {
		this.runAndRead(cmd).split(`\n`).forEach((line) => {
			if (line) {
				echo(cleanUp(line));
			}
		});
	}

	static runTask(title, cmd) {
		this.titleBox(title);
		this.run(cmd);
		this.completionBox();
	}

	static runScript(file, ...arg) {
		this.titleBox(`${STATIC.scripts.titles[file]}  ${chalk.underline(file)}`);
		spawnSync('bash', [`${STATIC.scripts.path}/${file}.sh`].concat(arg), { stdio:'inherit' });
		this.completionBox();
	}

};
