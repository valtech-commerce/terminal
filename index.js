//--------------------------------------------------------
//-- Terminal utilities
//--------------------------------------------------------
'use strict';

const chalk                         = require('chalk');
const { spawnSync, execSync, exec } = require('child_process');
const emoji                         = require('node-emoji');
const ora                           = require('ora');
const prettyMs                      = require('pretty-ms');
const redent                        = require('redent');
const stringLength                  = require('string-length');
const stringWidth                   = require('string-width');
const pad                           = require('@absolunet/terminal-pad');


//-- Static properties
const __ = {
	lang:         'en',
	logo:         '•',
	textColor:    chalk.blue,
	bgColor:      chalk.white.bgBlue,
	spinnerColor: 'blue',
	spinnerType:  'dots3',
	scripts:      {
		path:   '.',
		titles: {}
	}
};


const DICTIONARY = {
	silentError: {
		fr: `Une erreur silencieuse s'est produite`,
		en: `A silent error has occurred`
	},
	sudo: {
		fr: 'Ça sert à rien de me forcer avec un sudo',
		en: 'It is useless to force me with a sudo'
	},
	completed: {
		fr: 'Complété',
		en: 'Completed'
	},
	after: {
		fr: 'après',
		en: 'after'
	}
};


const echo = console.log;  // eslint-disable-line no-console

const trans = (key) => {
	return DICTIONARY[key][__.lang];
};

const cleanUp = (text = '') => {
	return redent(text, 2).replace(/\t/ug, '  ');
};

const box = (text, style, padding = true, extraPadding) => {
	let content = cleanUp(text).replace(/^\n+/ug, '').replace(/\n+\s*$/ug, '');
	content = padding ? `\n${content}\n` : content;

	const lines = content.split('\n');
	const max = Math.max(...lines.map((line) => { return stringWidth(line); }));
	const padLength = max < 79 ? 80 : max + 2;

	echo('\n');

	let i = 0;
	lines.forEach((line) => {
		echo(style(pad(line, padLength) + (extraPadding && i === 2 ? ' ' : '')));
		++i;
	});
	echo('\n');
};






class Terminal {

	get chalk() {
		return chalk;
	}

	setDefault({ logo = '?', textColor = chalk.blue, bgColor = chalk.white.bgBlue, spinnerColor = 'blue', lang = 'en', spinnerType = 'dots3' }) {
		__.logo         = logo;
		__.textColor    = textColor;
		__.bgColor      = bgColor;
		__.spinnerColor = spinnerColor;
		__.lang         = lang;
		__.spinnerType  = spinnerType;
	}

	setScriptsFiles(path, titles) {
		__.scripts.path   = path;
		__.scripts.titles = titles;
	}






	exit(text) {
		if (text) {
			this.errorBox(text);
		}

		process.exit(2); // eslint-disable-line no-process-exit, unicorn/no-process-exit
	}

	echo(str) {
		echo(str);
	}

	echoIndent(str) {
		echo(cleanUp(str));
	}

	print(str) {
		echo(__.textColor(cleanUp(str)));
	}

	println(str) {
		this.print(`${str}\n`);
	}

	spacer(nb = 1) {
		this.print('\n'.repeat(nb - 1));
	}

	warning(text, newline = true) {
		echo(chalk.yellow(cleanUp(`${text}${newline ? '\n' : ''}`)));
	}

	error(text) {
		echo(chalk.red(cleanUp(`\n${text}\n`)));
	}

	success(str) {
		echo(chalk.green(cleanUp(`✓  ${str}\n`)));
	}

	failure(str) {
		echo(chalk.red(cleanUp(`✘  ${str}\n`)));
	}

	dontSudoMe() {
		this.errorBox(`${trans('sudo')} ${emoji.get('cry')}`);
	}

	printState(options) {
		const { state, name, value, msg } = options;
		const mark     = state ? '✓' : '✘';
		const color    = state ? chalk.green : chalk.red;
		const errorMsg = state ? '' : msg;

		this.echoIndent(`${chalk.bold(`${name}`)}  ${color(`${mark}  ${value} ${errorMsg}`)}`);
	}

	printStatus(status) {
		const colors = {
			not_added: 'green', // eslint-disable-line camelcase
			created:   'green',
			modified:  'yellow',
			renamed:   'yellow',
			deleted:   'red'
		};

		this.spacer(2);

		['not_added', 'created', 'modified', 'renamed', 'deleted'].forEach((type) => {
			if (status[type].length !== 0) {
				status[type].forEach((file) => {
					this.echoIndent(`${chalk[colors[type]](pad(`${type}:`, 12))} ${type === 'renamed' ? `${file.from} → ${file.to}` : file}`);
				});
			}
		});

		this.spacer(2);
	}






	titleBox(text) {
		__.titleboxStart = new Date();

		const extraPadding = __.logo.length === stringWidth(__.logo) && __.logo.length === stringLength(__.logo);

		box(`
			${chalk.reset('        ')}${__.bgColor(' ')}
			${chalk.reset(`   ${__.logo}${extraPadding ? ' ' : ''}   `)}${__.bgColor(' ')} ${text}
			${chalk.reset('        ')}${__.bgColor(' ')}
		`, __.bgColor, true, extraPadding && __.logo.length === 2);
	}

	infoBox(text) {
		box(text, __.bgColor);
	}

	warningBox(text) {
		box(text, chalk.bgYellow.black);
	}

	errorBox(text) {
		box(text, chalk.bgRed.white);
	}

	completionBox(showDuration = true) {
		const time = showDuration && __.titleboxStart ? ` ${trans('after')} ${prettyMs(new Date() - __.titleboxStart)}` : '';

		box(`✓  ${trans('completed')}${time}`, __.bgColor);

		__.titleboxStart = undefined;
		this.spacer(2);
	}






	startSpinner(text) {
		return ora({
			text:    text,
			spinner: __.spinnerType,
			color:   __.spinnerColor
		}).start();
	}






	run(cmd) {
		execSync(cmd, { stdio:'inherit' });
	}

	runPromise(cmd, { ignoreError = '', silent = false } = {}) {

		return new Promise((resolve) => {
			exec(cmd, { stdio:'inherit' }, (error, stdout, stderr) => {
				const output   = stdout.trim();
				let errorOuput = stderr.trim();
				let errorMsg   = error ? error.toString().trim() : '';

				if (ignoreError) {
					errorMsg  = errorMsg.replace(ignoreError, '').trim();
					errorOuput = stderr.replace(ignoreError, '').trim();
				}

				// Error
				if (!silent) {
					if (errorMsg) {

						// Show normal output
						if (output) {
							this.echo(output);
						}

						// Make the silence talk
						if (!errorOuput) {
							this.error(trans('silentError'));
						}

						this.error(`
							${errorMsg || ''}
							${errorOuput || ''}
						`);

						this.exit();


					// Warning
					} else if (errorOuput) {

						// Show normal output
						if (output) {
							this.echo(output);
						}

						this.warning(errorOuput);
					}
				}

				resolve({ error, stdout, stderr });
			});
		});
	}

	runAndRead(cmd) {
		return execSync(cmd, { stdio:['inherit', 'pipe', 'inherit'], encoding:'utf8' });
	}

	runAndGet(cmd) {
		const lines = [];

		this.runAndRead(cmd).split(`\n`).forEach((line) => {
			if (line) {
				lines.push(line);
			}
		});

		return lines.join(' / ');
	}

	runAndEcho(cmd) {
		this.runAndRead(cmd).split(`\n`).forEach((line) => {
			if (line) {
				this.echoIndent(line);
			}
		});
	}

	runTask(title, cmd) {
		this.titleBox(title);
		this.run(cmd);
		this.completionBox();
	}

	runScript(file, ...arg) {
		this.titleBox(`${__.scripts.titles[file]}  ${chalk.underline(file)}`);
		spawnSync('bash', [`${__.scripts.path}/${file}.sh`].concat(arg), { stdio:'inherit' });
		this.completionBox();
	}

}


module.exports = new Terminal();
